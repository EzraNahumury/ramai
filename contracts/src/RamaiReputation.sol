// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title RamaiReputation
/// @notice Soulbound attendance reputation. Non-transferable by design — there
///         are no transfer functions; reputation is a plain per-address counter
///         that can only be incremented by the RamaiEvents contract on a
///         verified check-in.
/// @dev Kept intentionally minimal for the hackathon MVP. The counter itself is
///      the "soulbound token": it cannot be moved, only earned.
contract RamaiReputation is Ownable {
    /// @notice Address of the RamaiEvents contract allowed to record attendance.
    address public events;

    /// @notice attendanceCount[user] = number of verified check-ins.
    mapping(address => uint256) public attendanceCount;

    event EventsContractSet(address indexed events);
    event AttendanceRecorded(address indexed user, uint256 indexed eventId, uint256 newCount);

    error NotEventsContract();
    error ZeroAddress();

    constructor() Ownable(msg.sender) {}

    modifier onlyEvents() {
        if (msg.sender != events) revert NotEventsContract();
        _;
    }

    /// @notice Set the RamaiEvents contract that is allowed to record attendance.
    /// @dev Set once during deployment wiring; owner-gated.
    function setEvents(address _events) external onlyOwner {
        if (_events == address(0)) revert ZeroAddress();
        events = _events;
        emit EventsContractSet(_events);
    }

    /// @notice Increment a user's attendance reputation. Only callable by RamaiEvents.
    /// @param user The attendee whose reputation increases.
    /// @param eventId The event the check-in belongs to (for indexing/logs).
    function recordAttendance(address user, uint256 eventId) external onlyEvents {
        uint256 newCount = ++attendanceCount[user];
        emit AttendanceRecorded(user, eventId, newCount);
    }

    /// @notice Read a user's attendance reputation.
    function reputationOf(address user) external view returns (uint256) {
        return attendanceCount[user];
    }
}
