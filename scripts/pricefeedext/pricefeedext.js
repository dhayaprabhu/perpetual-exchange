const { utils } = require("ethers");
const crypto = require( 'crypto' );
const { deployContract, contractAt , sendTxn } = require("../shared/helpers")

async function main() {
    // const PriceFeedExt = await deployContract("PriceFeedExt", ["skl price feed", "8"])
    // const PriceFeedExtBTC = await deployContract("PriceFeedExt", ["btc price feed", "8"])
    const PriceFeedExtUSDT = await deployContract("PriceFeedExt", ["usdt price feed", "8"])
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });