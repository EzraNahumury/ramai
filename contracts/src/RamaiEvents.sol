// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRamaiReputation {
    function recordAttendance(address user, uint256 eventId) external;
}

/// @title RamaiEvents
/// @notice Event registry + refundable RSVP stake escrow + organizer check-in.
///         Only commitment state lives on-chain. Rich/private data (profiles,
///         descriptions, media, interests) stays off-chain, linked by event id.
/// @dev MVP simplification: check-in is called directly by the event organizer
///      (msg.sender == organizer). A relay/signature path is future work.
contract RamaiEvents is Ownable, ReentrancyGuard {
    struct Event {
        address organizer;
        uint256 stakeAmount; // 0 = free event (no stake)
        uint64 startTime;
        uint64 checkInDeadline; // last time to join / cancel-refund / check-in
        uint32 capacity; // 0 = unlimited
        uint32 joinedCount; // current active RSVPs (excludes cancelled)
        bool active;
        address forfeitTo; // where no-show stakes go (default: organizer)
    }

    struct RSVP {
        bool joined;
        bool checkedIn;
        bool settled; // refund or forfeit already processed
        uint256 staked;
    }

    uint256 public nextEventId;
    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => RSVP)) public rsvps;

    /// @notice Optional RamaiReputation contract; if set, check-ins bump reputation.
    address public reputation;

    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 stakeAmount,
        uint64 startTime,
        uint64 checkInDeadline,
        uint32 capacity,
        address forfeitTo
    );
    event Joined(uint256 indexed eventId, address indexed user, uint256 staked);
    event RSVPCancelled(uint256 indexed eventId, address indexed user, uint256 refunded);
    event CheckedIn(uint256 indexed eventId, address indexed user);
    event RefundClaimed(uint256 indexed eventId, address indexed user, uint256 amount);
    event Settled(uint256 indexed eventId, uint256 totalForfeited, uint256 noShowCount);
    event ReputationSet(address indexed reputation);

    error InvalidTimeWindow();
    error EventNotActive();
    error RegistrationClosed();
    error WrongStakeValue();
    error AlreadyJoined();
    error NotJoined();
    error CapacityFull();
    error NotOrganizer();
    error AlreadyCheckedIn();
    error NotCheckedIn();
    error AlreadySettled();
    error DeadlineNotPassed();
    error CheckInClosed();
    error TransferFailed();

    constructor() Ownable(msg.sender) {}

    /// @notice Wire the reputation contract (owner-gated, done at setup).
    function setReputation(address _reputation) external onlyOwner {
        reputation = _reputation;
        emit ReputationSet(_reputation);
    }

    /// @notice Create an event. Caller becomes the organizer.
    /// @param stakeAmount Required RSVP stake in wei (0 for a free event).
    /// @param startTime Event start (unix seconds).
    /// @param checkInDeadline Last time to join, cancel-with-refund, or check in.
    /// @param capacity Max active RSVPs (0 = unlimited).
    /// @param forfeitTo Destination for forfeited no-show stakes (0 = organizer).
    /// @return eventId The new event id.
    function createEvent(
        uint256 stakeAmount,
        uint64 startTime,
        uint64 checkInDeadline,
        uint32 capacity,
        address forfeitTo
    ) external returns (uint256 eventId) {
        if (checkInDeadline <= block.timestamp || startTime >= checkInDeadline) {
            revert InvalidTimeWindow();
        }

        eventId = nextEventId++;
        events[eventId] = Event({
            organizer: msg.sender,
            stakeAmount: stakeAmount,
            startTime: startTime,
            checkInDeadline: checkInDeadline,
            capacity: capacity,
            joinedCount: 0,
            active: true,
            forfeitTo: forfeitTo == address(0) ? msg.sender : forfeitTo
        });

        emit EventCreated(eventId, msg.sender, stakeAmount, startTime, checkInDeadline, capacity, events[eventId].forfeitTo);
    }

    /// @notice RSVP to an event, escrowing the required stake.
    function joinEvent(uint256 eventId) external payable nonReentrant {
        Event storage ev = events[eventId];
        if (!ev.active) revert EventNotActive();
        if (block.timestamp >= ev.checkInDeadline) revert RegistrationClosed();
        if (msg.value != ev.stakeAmount) revert WrongStakeValue();

        RSVP storage r = rsvps[eventId][msg.sender];
        if (r.joined) revert AlreadyJoined();
        if (ev.capacity != 0 && ev.joinedCount >= ev.capacity) revert CapacityFull();

        r.joined = true;
        r.settled = false;
        r.staked = msg.value;
        unchecked {
            ev.joinedCount += 1;
        }

        emit Joined(eventId, msg.sender, msg.value);
    }

    /// @notice Cancel an RSVP before the deadline and reclaim the stake.
    function cancelRSVP(uint256 eventId) external nonReentrant {
        Event storage ev = events[eventId];
        RSVP storage r = rsvps[eventId][msg.sender];
        if (!r.joined) revert NotJoined();
        if (r.checkedIn) revert AlreadyCheckedIn();
        if (r.settled) revert AlreadySettled();
        if (block.timestamp >= ev.checkInDeadline) revert RegistrationClosed();

        uint256 amount = r.staked;
        // effects before interaction
        r.joined = false;
        r.settled = true;
        r.staked = 0;
        unchecked {
            ev.joinedCount -= 1;
        }

        emit RSVPCancelled(eventId, msg.sender, amount);
        if (amount > 0) _safeTransfer(msg.sender, amount);
    }

    /// @notice Organizer confirms a single attendee's attendance.
    function checkIn(uint256 eventId, address attendee) external {
        _checkIn(eventId, attendee);
    }

    /// @notice Organizer confirms multiple attendees in one call.
    function checkInBatch(uint256 eventId, address[] calldata attendees) external {
        for (uint256 i = 0; i < attendees.length; i++) {
            _checkIn(eventId, attendees[i]);
        }
    }

    function _checkIn(uint256 eventId, address attendee) internal {
        Event storage ev = events[eventId];
        if (msg.sender != ev.organizer) revert NotOrganizer();
        if (block.timestamp > ev.checkInDeadline) revert CheckInClosed();

        RSVP storage r = rsvps[eventId][attendee];
        if (!r.joined) revert NotJoined();
        if (r.checkedIn) revert AlreadyCheckedIn();

        r.checkedIn = true;
        emit CheckedIn(eventId, attendee);

        if (reputation != address(0)) {
            IRamaiReputation(reputation).recordAttendance(attendee, eventId);
        }
    }

    /// @notice Attendee reclaims their stake after being checked in.
    function claimRefund(uint256 eventId) external nonReentrant {
        RSVP storage r = rsvps[eventId][msg.sender];
        if (!r.checkedIn) revert NotCheckedIn();
        if (r.settled) revert AlreadySettled();

        uint256 amount = r.staked;
        r.settled = true;
        r.staked = 0;

        emit RefundClaimed(eventId, msg.sender, amount);
        if (amount > 0) _safeTransfer(msg.sender, amount);
    }

    /// @notice After the deadline, organizer forfeits the stakes of no-shows.
    /// @param attendees Addresses to settle (joined but never checked in).
    function settleNoShows(uint256 eventId, address[] calldata attendees) external nonReentrant {
        Event storage ev = events[eventId];
        if (msg.sender != ev.organizer) revert NotOrganizer();
        if (block.timestamp <= ev.checkInDeadline) revert DeadlineNotPassed();

        uint256 total = 0;
        uint256 count = 0;
        for (uint256 i = 0; i < attendees.length; i++) {
            RSVP storage r = rsvps[eventId][attendees[i]];
            if (r.joined && !r.checkedIn && !r.settled) {
                r.settled = true;
                total += r.staked;
                r.staked = 0;
                unchecked {
                    count += 1;
                }
            }
        }

        emit Settled(eventId, total, count);
        if (total > 0) _safeTransfer(ev.forfeitTo, total);
    }

    /// @notice Deactivate an event (stops new RSVPs). Existing stakes unaffected.
    function deactivateEvent(uint256 eventId) external {
        Event storage ev = events[eventId];
        if (msg.sender != ev.organizer) revert NotOrganizer();
        ev.active = false;
    }

    // ---- views ----

    function getEventInfo(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }

    function getRSVP(uint256 eventId, address user) external view returns (RSVP memory) {
        return rsvps[eventId][user];
    }

    // ---- internal ----

    function _safeTransfer(address to, uint256 amount) private {
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
