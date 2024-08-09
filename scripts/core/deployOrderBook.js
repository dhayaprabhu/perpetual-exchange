const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  await deployContract("OrderBook", []);
  const orderBook = await contractAt("OrderBook", getDeployFilteredInfo("OrderBook").imple);

  const routerInfo = getDeployFilteredInfo("Router")
  const vaultInfo = getDeployFilteredInfo("Vault")
  const usdgInfo = getDeployFilteredInfo("USDG")

  await sendTxn(orderBook.initialize(
    routerInfo.imple, // router
    vaultInfo.imple, // vault
    usdgInfo.imple, // usdg
    expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize");

  const router = await contractAt("Router", routerInfo.imple);
  await sendTxn(router.addPlugin(orderBook.address), "router.addPlugin");

  writeTmpAddresses({
    orderBook: orderBook.address
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
