const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  // const referralStorageGov = await contractAt("Timelock", await referralStorage.gov())
  const { imple: vaultAddr } = getDeployFilteredInfo("Vault")
  const { imple: routerAddr } = getDeployFilteredInfo("Router")
  const { imple: referralStorageAddr } = getDeployFilteredInfo("ReferralStorage")
  const { imple: shortsTrackerAddr } = getDeployFilteredInfo("ShortsTracker")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "0" // 0 sFUEL

  const positionRouterArgs = [vaultAddr, routerAddr, shortsTrackerAddr, depositFee]
  await deployContract("PositionRouter", positionRouterArgs)
  const positionRouter = await contractAt("PositionRouter", getDeployFilteredInfo("PositionRouter").imple)

  await sendTxn(positionRouter.setReferralStorage(referralStorageAddr), "positionRouter.setReferralStorage")
  // await sendTxn(referralStorageGov.signalSetHandler(referralStorage.address, positionRouter.address, true), "referralStorage.signalSetHandler(positionRouter)")

  const shortsTracker = await contractAt("ShortsTracker", shortsTrackerAddr)
  await sendTxn(shortsTracker.setHandler(positionRouter.address, true), "shortsTracker.setHandler(positionRouter)")

  const router = await contractAt("Router", routerAddr)
  await sendTxn(router.addPlugin(positionRouter.address), "router.addPlugin")

  await sendTxn(positionRouter.setDelayValues(1, 180, 30 * 60), "positionRouter.setDelayValues")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
