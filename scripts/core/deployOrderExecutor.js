const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const vault = await contractAt("Vault", "0x16B6Ee31b12df54651468391ee660E6ae3D99a70")
  const orderBook = await contractAt("OrderBook", "0x73D65F7771Ddb394534Ba89713c751F48250A41a")
  await deployContract("OrderExecutor", [vault.address, orderBook.address])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
