import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LendingProtocol, MCSToken__factory} from "../typechain-types";
import tokenJSON from "../artifacts/contracts/LendingProtocol.sol/MCSToken.json";

describe("LendingProtocol", function() {
    async function deploy() {
      const [ owner, user ] = await ethers.getSigners();
      const LendingFactory = await ethers.getContractFactory("LendingProtocol");
      const lending : LendingProtocol = await LendingFactory.deploy();
      await lending.deployed();
      const erc20 = new ethers.Contract(await lending.token(), tokenJSON.abi, owner);

      return { lending, owner, user , erc20}
    }

    it("should have an owner and a token", async function() {
      const { lending , owner } = await loadFixture(deploy);
      expect(await lending.owner()).to.eq(owner.address)

      expect(await lending.token()).to.be.properAddress
    });

    it("allows to buy", async function() {
      const { owner, erc20 } = await loadFixture(deploy);

      const tx = await erc20.mint(100, owner.address)
      await tx.wait()

      expect(await erc20.balanceOf(owner.address)).to.eq(100)
    });
});