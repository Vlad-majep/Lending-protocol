import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LendingProtocol, LendingProtocol__factory} from "../typechain-types";

describe("LendingProtocol", function() {
    async function deploy() {
      const [ owner, user ] = await ethers.getSigners();
  
      const LendingFactory = await ethers.getContractFactory("LendingProtocol");
      const lending : LendingProtocol = await LendingFactory.deploy();
      await lending.deployed();
  
      return { lending, owner, user }
    }
  
    it("allows to deposit() ", async function() {
      const { lending , owner } = await loadFixture(deploy);
      const tx = await lending.deposit(owner.address, 1000);
      await tx.wait();
  
      expect(await lending.tokenSupply(owner.address)).to.eq(1000);
    });
});
