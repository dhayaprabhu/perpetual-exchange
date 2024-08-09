const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function main() {
  // const signer = await getFrameSigner()

  const admin = getDeployFilteredInfo("MultiSigner1").imple
  const buffer = 0// 24 * 60 * 60

  const { imple: tokenManagerAddr } = getDeployFilteredInfo("TokenManager")

  await deployContract("PriceFeedTimelock", [
    admin,
    buffer,
    tokenManagerAddr
  ], "Timelock")

  const priceFeedTimelock = await contractAt("PriceFeedTimelock", getDeployFilteredInfo("PriceFeedTimelock").imple)

  const signers = [
    getDeployFilteredInfo("MultiSigner1").imple, // me
  ]

  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i]
    await sendTxn(priceFeedTimelock.setContractHandler(signer, true), `priceFeedTimelock.setContractHandler(${signer})`)
  }

  const keepers = [
    getDeployFilteredInfo("MultiSigner1").imple, // me
  ]

  for (let i = 0; i < keepers.length; i++) {
    const keeper = keepers[i]
    await sendTxn(priceFeedTimelock.setKeeper(keeper, true), `priceFeedTimelock.setKeeper(${keeper})`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
