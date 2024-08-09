const { utils } = require("ethers");
const crypto = require( 'crypto' );
const { deployContract, contractAt , sendTxn } = require("../shared/helpers")

async function main() {
    // const DataFeed = await deployContract("DataFeed", [])
    const DataFeed = await contractAt("DataFeed", "0x11791d12a14c759E9e5b0D6f5d0c9e3f71AaBBB1")

    const hash = utils.keccak256(utils.toUtf8Bytes("ETHUSD"));
    console.log(hash)

    const res = await sendTxn(DataFeed["getResult"](
        hash
      ), `DataFeed`)

    console.log(res.res)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });