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
    // approve property
    const txApprove = await realEstate
      .connect(seller)
      .approve(escrow.address, 1);
    await txApprove.wait();
    // list property
    const txList = await escrow.connect(seller).list(1);
    await txList.wait();
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

  describe("Listing", () => {
    it("Update ownership", async () => {
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
    });
    it("Update as listed", async () => {
      const listedresult = await escrow.isListed(1);
      expect(listedresult).to.be.equal(true);
    });
  });
});
