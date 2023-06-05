const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  let buyer, seller, inspector, lender;
  let realEstate;
  beforeEach(async () => {
    // Setup accounts
    [buyer, seller, inspector, lender] = await ethers.getSigners();
    //deploy Real Eestate
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    // console.log(realEstate.address);
    //mint
    let tx = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
      );
    await tx.wait();
    // deploy escrow
    escrow = await (
      await ethers.getContractFactory("Escrow")
    ).deploy(
      realEstate.address,
      seller.address,
      inspector.address,
      lender.address
    );
  });

  describe("Deployment", () => {
    it("Returns NFT address", async () => {
      const nftAddress = await escrow.nftAddress();
      expect(nftAddress).to.be.equal(realEstate.address);
    });

    it("Returns seller", async () => {
      const sellersAddress = await escrow.seller();
      expect(sellersAddress).to.be.equal(seller.address);
    });

    it("Returns inspector", async () => {
      const inspectorsAddress = await escrow.inspector();
      expect(inspectorsAddress).to.be.equal(inspector.address);
    });

    it("Returns lender", async () => {
      const lendersAddress = await escrow.lender();
      expect(lendersAddress).to.be.equal(lender.address);
    });
  });

  it("saves the address", async () => {});
});
