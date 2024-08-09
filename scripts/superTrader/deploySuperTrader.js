const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function main() {
  await deployContract("SuperTrader", [])
  const superTrader = await contractAt("SuperTrader", getDeployFilteredInfo("SuperTrader").imple)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
