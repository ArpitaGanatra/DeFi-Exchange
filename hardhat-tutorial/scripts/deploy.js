const { ethers } = require("hardhat");
const {CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS} = require('../constants')

async function main() {
    const cryptoDevTokenAddress = CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS;
    const exchangeContract = await ethers.getContractFactory("Exchange");
    const deployedExchangeContract = await exchangeContract.deploy(cryptoDevTokenAddress);
    await deployedExchangeContract.deployed();

    console.log('Deployed Exchange Contract Address: ', deployedExchangeContract.address);
    // Deployed Exchange Contract Address:  0xFebEd9161916Dc8d34cA167C4CA49EB5C48be590
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})