const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const STAKE = ethers.parseEther("0.01");

async function deployFixture() {
  const [owner, organizer, alice, bob, carol] = await ethers.getSigners();

  const Reputation = await ethers.getContractFactory("RamaiReputation");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();

  const Events = await ethers.getContractFactory("RamaiEvents");
  const events = await Events.deploy();
  await events.waitForDeployment();

  await reputation.setEvents(await events.getAddress());
  await events.setReputation(await reputation.getAddress());

  return { owner, organizer, alice, bob, carol, reputation, events };
}

// Helper: create a staked event, returns eventId + timing.
async function createStakedEvent(events, organizer, { stake = STAKE, capacity = 0 } = {}) {
  const now = await time.latest();
  const startTime = now + 3600;
  const checkInDeadline = now + 7200;
  const tx = await events
    .connect(organizer)
    .createEvent(stake, startTime, checkInDeadline, capacity, ethers.ZeroAddress);
  await tx.wait();
  const eventId = (await events.nextEventId()) - 1n;
  return { eventId, startTime, checkInDeadline };
}

describe("RamaiReputation", () => {
  it("only the events contract can record attendance", async () => {
    const { reputation, alice } = await deployFixture();
    await expect(reputation.connect(alice).recordAttendance(alice.address, 0))
      .to.be.revertedWithCustomError(reputation, "NotEventsContract");
  });

  it("setEvents is owner-gated and rejects zero address", async () => {
    const { reputation, alice } = await deployFixture();
    await expect(reputation.connect(alice).setEvents(alice.address))
      .to.be.revertedWithCustomError(reputation, "OwnableUnauthorizedAccount");
    await expect(reputation.setEvents(ethers.ZeroAddress))
      .to.be.revertedWithCustomError(reputation, "ZeroAddress");
  });
});

describe("RamaiEvents — createEvent", () => {
  it("creates an event and emits", async () => {
    const { events, organizer } = await deployFixture();
    const now = await time.latest();
    await expect(
      events.connect(organizer).createEvent(STAKE, now + 3600, now + 7200, 0, ethers.ZeroAddress)
    ).to.emit(events, "EventCreated");
    const ev = await events.getEventInfo(0);
    expect(ev.organizer).to.equal(organizer.address);
    expect(ev.stakeAmount).to.equal(STAKE);
    expect(ev.forfeitTo).to.equal(organizer.address); // zero defaults to organizer
  });

  it("reverts on invalid time window", async () => {
    const { events, organizer } = await deployFixture();
    const now = await time.latest();
    // deadline in the past
    await expect(
      events.connect(organizer).createEvent(STAKE, now + 10, now - 10, 0, ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(events, "InvalidTimeWindow");
    // startTime after deadline
    await expect(
      events.connect(organizer).createEvent(STAKE, now + 8000, now + 7200, 0, ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(events, "InvalidTimeWindow");
  });
});

describe("RamaiEvents — joinEvent", () => {
  it("joins with correct stake and escrows funds", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await expect(events.connect(alice).joinEvent(eventId, { value: STAKE }))
      .to.emit(events, "Joined")
      .withArgs(eventId, alice.address, STAKE);
    expect(await ethers.provider.getBalance(await events.getAddress())).to.equal(STAKE);
    const r = await events.getRSVP(eventId, alice.address);
    expect(r.joined).to.equal(true);
    expect(r.staked).to.equal(STAKE);
  });

  it("rejects wrong stake value", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await expect(events.connect(alice).joinEvent(eventId, { value: STAKE - 1n }))
      .to.be.revertedWithCustomError(events, "WrongStakeValue");
  });

  it("rejects double join", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await expect(events.connect(alice).joinEvent(eventId, { value: STAKE }))
      .to.be.revertedWithCustomError(events, "AlreadyJoined");
  });

  it("enforces capacity", async () => {
    const { events, organizer, alice, bob } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer, { capacity: 1 });
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await expect(events.connect(bob).joinEvent(eventId, { value: STAKE }))
      .to.be.revertedWithCustomError(events, "CapacityFull");
  });

  it("rejects joining after deadline", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId, checkInDeadline } = await createStakedEvent(events, organizer);
    await time.increaseTo(checkInDeadline + 1);
    await expect(events.connect(alice).joinEvent(eventId, { value: STAKE }))
      .to.be.revertedWithCustomError(events, "RegistrationClosed");
  });

  it("supports free events (zero stake)", async () => {
    const { events, organizer, alice } = await deployFixture();
    const now = await time.latest();
    await events.connect(organizer).createEvent(0, now + 3600, now + 7200, 0, ethers.ZeroAddress);
    await expect(events.connect(alice).joinEvent(0, { value: 0 })).to.emit(events, "Joined");
  });
});

describe("RamaiEvents — cancelRSVP", () => {
  it("refunds stake before deadline", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await expect(events.connect(alice).cancelRSVP(eventId)).to.changeEtherBalance(alice, STAKE);
    const r = await events.getRSVP(eventId, alice.address);
    expect(r.settled).to.equal(true);
    expect(r.joined).to.equal(false);
    const ev = await events.getEventInfo(eventId);
    expect(ev.joinedCount).to.equal(0);
  });

  it("reverts cancel after deadline", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId, checkInDeadline } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await time.increaseTo(checkInDeadline + 1);
    await expect(events.connect(alice).cancelRSVP(eventId))
      .to.be.revertedWithCustomError(events, "RegistrationClosed");
  });

  it("reverts cancel when not joined", async () => {
    const { events, organizer, bob } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await expect(events.connect(bob).cancelRSVP(eventId))
      .to.be.revertedWithCustomError(events, "NotJoined");
  });
});

describe("RamaiEvents — checkIn", () => {
  it("organizer checks in attendee and reputation increments", async () => {
    const { events, reputation, organizer, alice } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await expect(events.connect(organizer).checkIn(eventId, alice.address))
      .to.emit(events, "CheckedIn")
      .withArgs(eventId, alice.address);
    expect(await reputation.reputationOf(alice.address)).to.equal(1n);
  });

  it("rejects non-organizer check-in", async () => {
    const { events, organizer, alice, bob } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await expect(events.connect(bob).checkIn(eventId, alice.address))
      .to.be.revertedWithCustomError(events, "NotOrganizer");
  });

  it("rejects double check-in", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await events.connect(organizer).checkIn(eventId, alice.address);
    await expect(events.connect(organizer).checkIn(eventId, alice.address))
      .to.be.revertedWithCustomError(events, "AlreadyCheckedIn");
  });

  it("rejects check-in of non-joined address", async () => {
    const { events, organizer, bob } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await expect(events.connect(organizer).checkIn(eventId, bob.address))
      .to.be.revertedWithCustomError(events, "NotJoined");
  });

  it("batch check-in works", async () => {
    const { events, reputation, organizer, alice, bob } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await events.connect(bob).joinEvent(eventId, { value: STAKE });
    await events.connect(organizer).checkInBatch(eventId, [alice.address, bob.address]);
    expect(await reputation.reputationOf(alice.address)).to.equal(1n);
    expect(await reputation.reputationOf(bob.address)).to.equal(1n);
  });
});

describe("RamaiEvents — claimRefund", () => {
  it("refunds after check-in", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await events.connect(organizer).checkIn(eventId, alice.address);
    await expect(events.connect(alice).claimRefund(eventId)).to.changeEtherBalance(alice, STAKE);
  });

  it("reverts refund without check-in", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await expect(events.connect(alice).claimRefund(eventId))
      .to.be.revertedWithCustomError(events, "NotCheckedIn");
  });

  it("reverts double refund", async () => {
    const { events, organizer, alice } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE });
    await events.connect(organizer).checkIn(eventId, alice.address);
    await events.connect(alice).claimRefund(eventId);
    await expect(events.connect(alice).claimRefund(eventId))
      .to.be.revertedWithCustomError(events, "AlreadySettled");
  });
});

describe("RamaiEvents — settleNoShows", () => {
  it("forfeits no-show stakes to forfeitTo after deadline", async () => {
    const { events, organizer, alice, bob } = await deployFixture();
    const { eventId, checkInDeadline } = await createStakedEvent(events, organizer);
    await events.connect(alice).joinEvent(eventId, { value: STAKE }); // will attend
    await events.connect(bob).joinEvent(eventId, { value: STAKE }); // no-show
    await events.connect(organizer).checkIn(eventId, alice.address);
    await time.increaseTo(checkInDeadline + 1);

    await expect(
      events.connect(organizer).settleNoShows(eventId, [alice.address, bob.address])
    ).to.changeEtherBalance(organizer, STAKE); // only bob's stake forfeited

    const rb = await events.getRSVP(eventId, bob.address);
    expect(rb.settled).to.equal(true);
    // alice checked in, not settled by no-show sweep, can still claim
    await expect(events.connect(alice).claimRefund(eventId)).to.changeEtherBalance(alice, STAKE);
  });

  it("reverts settle before deadline", async () => {
    const { events, organizer, bob } = await deployFixture();
    const { eventId } = await createStakedEvent(events, organizer);
    await events.connect(bob).joinEvent(eventId, { value: STAKE });
    await expect(events.connect(organizer).settleNoShows(eventId, [bob.address]))
      .to.be.revertedWithCustomError(events, "DeadlineNotPassed");
  });

  it("reverts settle by non-organizer", async () => {
    const { events, organizer, alice, bob } = await deployFixture();
    const { eventId, checkInDeadline } = await createStakedEvent(events, organizer);
    await events.connect(bob).joinEvent(eventId, { value: STAKE });
    await time.increaseTo(checkInDeadline + 1);
    await expect(events.connect(alice).settleNoShows(eventId, [bob.address]))
      .to.be.revertedWithCustomError(events, "NotOrganizer");
  });
});

describe("RamaiEvents — fund accounting invariant", () => {
  it("in == refunds + forfeits + remaining", async () => {
    const { events, organizer, alice, bob, carol } = await deployFixture();
    const { eventId, checkInDeadline } = await createStakedEvent(events, organizer);
    const addr = await events.getAddress();

    await events.connect(alice).joinEvent(eventId, { value: STAKE }); // attend -> refund
    await events.connect(bob).joinEvent(eventId, { value: STAKE }); // cancel -> refund
    await events.connect(carol).joinEvent(eventId, { value: STAKE }); // no-show -> forfeit
    expect(await ethers.provider.getBalance(addr)).to.equal(STAKE * 3n);

    await events.connect(bob).cancelRSVP(eventId); // refund bob
    await events.connect(organizer).checkIn(eventId, alice.address);
    await events.connect(alice).claimRefund(eventId); // refund alice
    await time.increaseTo(checkInDeadline + 1);
    await events.connect(organizer).settleNoShows(eventId, [carol.address]); // forfeit carol

    expect(await ethers.provider.getBalance(addr)).to.equal(0n); // fully drained
  });
});
