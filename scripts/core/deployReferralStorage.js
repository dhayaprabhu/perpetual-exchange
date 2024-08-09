const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function getArbValues() {
  const positionRouter = await contractAt("PositionRouter", "0x3D6bA331e3D9702C5e8A8d254e5d8a285F223aba")
  const positionManager = await contractAt("PositionManager", "0x87a4088Bd721F83b6c2E5102e2FA47022Cb1c831")

  return { positionRouter, positionManager }
}

async function getAvaxValues() {
  const positionRouter = await contractAt("PositionRouter", "0x195256074192170d1530527abC9943759c7167d8")
  const positionManager = await contractAt("PositionManager", "0xF2ec2e52c3b5F8b8bd5A3f93945d05628A233216")

  return { positionRouter, positionManager }
}

async function getValues() {
  if (network === "arbitrum") {
    return getArbValues()
  }

  if (network === "avax") {
    return getAvaxValues()
  }
}

async function main() {
  // const { positionRouter, positionManager } = await getValues()
  await deployContract("ReferralStorage", [])
  const referralStorage = await contractAt("ReferralStorage", getDeployFilteredInfo("ReferralStorage").imple)
  
  await sendTxn(referralStorage.setTier(0, 1000, 5000), "referralStorage.setTier(0, 1000, 5000)")
  await sendTxn(referralStorage.setTier(1, 2000, 6000), "referralStorage.setTier(1, 2000, 6000)")
  await sendTxn(referralStorage.setTier(2, 2700, 4444), "referralStorage.setTier(2, 2700, 4444)")
  // // await sendTxn(positionRouter.setReferralStorage(referralStorage.address), "positionRouter.setReferralStorage")
  // // await sendTxn(positionManager.setReferralStorage(referralStorage.address), "positionManager.setReferralStorage")

  // await sendTxn(referralStorage.setHandler(positionRouter.address, true), "referralStorage.setHandler(positionRouter)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
