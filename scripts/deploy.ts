import { ethers } from "hardhat";

async function main() {
  const [ owner ] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);

  console.log("Account balance:", (await owner.getBalance()).toString());

  const task = await ethers.getContractFactory("LendingProtocol", owner);
  const contract = await task.deploy();
  const tok = await contract.token();

  console.log("Contract address:", contract.address);
  console.log("Token address:", tok)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});