import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LendingProtocol} from "../typechain-types";
import tokenJSON from "../artifacts/contracts/LendingProtocol.sol/MCSToken.json";

describe("LendingProtocol", function() {
    async function deploy() {
      const [ owner, user ] = await ethers.getSigners();
      const LendingFactory = await ethers.getContractFactory("LendingProtocol", owner);
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
      const tokenAmount = 1000

      const txData = {
        value: tokenAmount,
        to: owner.address
      }

      const tx = await erc20.mint(txData)
      await tx.wait()

      expect(await erc20.balanceOf(owner.address)).to.eq(tokenAmount)

      await expect(() => tx).
        to.changeEtherBalance(owner, tokenAmount)

      await expect(tx)
        .to.emit(owner, "Bought")
        .withArgs(tokenAmount, owner.address)
    });
});