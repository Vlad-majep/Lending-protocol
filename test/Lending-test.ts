import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LendingProtocol} from "../typechain-types";

describe("LendingProtocol", function() {
    async function deploy() {
      const [ owner, user2 ] = await ethers.getSigners();
      const LendingFactory = await ethers.getContractFactory("LendingProtocol");
      const lending : LendingProtocol = await LendingFactory.deploy();
      await lending.deployed();
      const token = await (await ethers.getContractFactory("MCSToken")).deploy(owner.address)

      return { lending, owner, user2 , token}
    }

    it("should have an deposit()", async function() {
      const { lending , owner, token } = await loadFixture(deploy);
      expect(await token.approve(lending.address,  1000))
      expect(await lending.deposit(token.address,  1000))

      expect(await token.balanceOf(owner.address)).to.eq(0)
      expect(await lending.tokenSupply(token.address)).to.eq(1000)
      expect(await lending.userCollateral(token.address, owner.address)).to.eq(1000)
      expect(await lending.totalCollateral(token.address)).to.eq(1000)
    });

    it("reverts call to deposit()", async function() {
      const {lending , token} = await loadFixture(deploy);

      await expect(lending.deposit(token.address, 0)).to.be.revertedWith("Amount must be greater than 0");
    });

    it("should have an borrow()", async function() {
      const {lending , token , owner} = await loadFixture(deploy);
      expect(await token.approve(lending.address, 1000))
      expect(await lending.deposit(token.address, 1000))
      expect(await lending.borrow(token.address, 700))

      expect(await token.balanceOf(owner.address)).to.eq(700)
      expect(await lending.tokenSupply(token.address)).to.eq(1000)
      expect(await lending.userBorrowed(token.address, owner.address)).to.eq(700)
      expect(await lending.totalBorrowed(token.address)).to.eq(700)
    });

    it("reverts call to borrow() with 0 amount", async function() {
      const {lending , token} = await loadFixture(deploy);
      
      await expect(lending.borrow(token.address, 0)).to.be.revertedWith("Amount must be greater than 0");
    });

    it("reverts call to borrow() with 0 Collateral", async function() {
      const {lending , token} = await loadFixture(deploy);
      
      await expect(lending.borrow(token.address, 10)).to.be.revertedWith("There is no collateral available to borrow against");
    });

    it("reverts call to borrow() up 80%", async function() {
      const {lending , token} = await loadFixture(deploy);
      expect(await token.approve(lending.address, 1000))
      expect(await lending.deposit(token.address, 1000))
      
      await expect(lending.borrow(token.address, 900)).to.be.revertedWith("Borrow amount exceeds the maximum borrow amount based on collateral");
    });

    it("should have an repay()", async function() {
      const {lending , token , owner} = await loadFixture(deploy);
      expect(await token.approve(lending.address, 1000))
      expect(await lending.deposit(token.address, 1000))
      expect(await lending.borrow(token.address, 700))
      expect(await token.approve(lending.address, 700))
      expect(await lending.repay(token.address, 700))

      expect(await token.balanceOf(owner.address)).to.eq(0)
      expect(await lending.tokenSupply(token.address)).to.eq(1000)
      expect(await lending.userBorrowed(token.address, owner.address)).to.eq(0)
      expect(await lending.totalBorrowed(token.address)).to.eq(0)
    });

    it("reverts call to repay() with 0 _amount", async function() {
      const {lending , token} = await loadFixture(deploy);

      
      await expect(lending.repay(token.address, 0)).to.be.revertedWith("Amount must be greater than 0");
    });

    it("reverts call to repay() amount > borrow", async function() {
      const {lending , token} = await loadFixture(deploy);
      expect(await token.approve(lending.address, 1000))
      expect(await lending.deposit(token.address, 1000))
      expect(await lending.borrow(token.address, 700))

      
      await expect(lending.repay(token.address, 800)).to.be.revertedWith("Repay amount exceeds the total borrowed amount");
    });


    it("should have an liquidate()", async function() {
      const {lending , token , owner} = await loadFixture(deploy);
      expect(await token.approve(lending.address, 1000))
      expect(await lending.deposit(token.address, 1000))
      expect(await lending.borrow(token.address, 700))
      expect(await token.approve(lending.address, 1000))
      expect(await lending.liquidate(token.address))

      expect(await token.balanceOf(owner.address)).to.eq(1000)
      expect(await lending.tokenSupply(token.address)).to.eq(0)
      expect(await lending.userBorrowed(token.address, owner.address)).to.eq(0)
      expect(await lending.totalBorrowed(token.address)).to.eq(0)
      expect(await lending.userCollateral(token.address, owner.address)).to.eq(0)
      expect(await lending.totalCollateral(token.address)).to.eq(0)
    });
});