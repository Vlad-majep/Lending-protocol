import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LendingProtocol} from "../typechain-types";

describe("LendingProtocol", function() {
    async function deploy() {
      const [ owner, user ] = await ethers.getSigners();
      const LendingFactory = await ethers.getContractFactory("LendingProtocol");
      const lending : LendingProtocol = await LendingFactory.deploy(1000);
      await lending.deployed();
      const token = await (await ethers.getContractFactory("ERC20", owner)).deploy("Dem9n", "D9")

      return { lending, owner, user , token}
    }

    it("should have an owner and token", async function() {
      const { lending , owner, token } = await loadFixture(deploy);
      expect(await lending.owner()).to.eq(owner.address)

      expect(await lending.balanceOf(owner.address)).to.eq(1000)

    });


    it("should have an deposit", async function() {
      const { lending , owner, token } = await loadFixture(deploy);
      expect(await lending.deposit(lending.token(),  1000))

      expect(await lending.balanceOf(owner.address)).to.eq(200)
    });
});