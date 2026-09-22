const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Network:", hre.network.name);

  // 1. Deploy RamaiReputation
  const Reputation = await hre.ethers.getContractFactory("RamaiReputation");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();
  const reputationAddr = await reputation.getAddress();
  console.log("RamaiReputation:", reputationAddr);

  // 2. Deploy RamaiEvents
  const Events = await hre.ethers.getContractFactory("RamaiEvents");
  const events = await Events.deploy();
  await events.waitForDeployment();
  const eventsAddr = await events.getAddress();
  console.log("RamaiEvents:", eventsAddr);

  // 3. Wire them: events must be allowed to write reputation, and events must
  //    know the reputation address.
  const tx1 = await reputation.setEvents(eventsAddr);
  await tx1.wait();
  const tx2 = await events.setReputation(reputationAddr);
  await tx2.wait();
  console.log("Wired: reputation.setEvents + events.setReputation done");

  console.log("\n--- Add to .env.local ---");
  console.log(`NEXT_PUBLIC_RAMAI_EVENTS_ADDRESS=${eventsAddr}`);
  console.log(`NEXT_PUBLIC_RAMAI_REPUTATION_ADDRESS=${reputationAddr}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
