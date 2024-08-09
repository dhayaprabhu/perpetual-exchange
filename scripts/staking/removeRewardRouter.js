const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const rewardRouter = await contractAt("RewardRouter", "0xEa7fCb85802713Cb03291311C66d6012b23402ea")
  const bnBlu = await contractAt("MintableBaseToken", "0x35247165119B69A40edD5304969560D0ef486921")
  const blpManager = await contractAt("BlpManager", "0x91425Ac4431d068980d497924DD540Ae274f3270")

  const stakedBluTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  const bonusBluTracker = await contractAt("RewardTracker", "0x4d268a7d4C16ceB5a606c173Bd974984343fea13")
  const feeBluTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  const feeBlpTracker = await contractAt("RewardTracker", "0x4e971a87900b931fF39d1Aad67697F49835400b6")
  const stakedBlpTracker = await contractAt("RewardTracker", "0x1aDDD80E6039594eE970E5872D247bf0414C8903")

  // allow rewardRouter to stake in stakedBluTracker
  await sendTxn(stakedBluTracker.setHandler(rewardRouter.address, false), "stakedBluTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in bonusBluTracker
  await sendTxn(bonusBluTracker.setHandler(rewardRouter.address, false), "bonusBluTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in feeBluTracker
  await sendTxn(feeBluTracker.setHandler(rewardRouter.address, false), "feeBluTracker.setHandler(rewardRouter)")
  // allow rewardRouter to burn bnBlu
  await sendTxn(bnBlu.setMinter(rewardRouter.address, false), "bnBlu.setMinter(rewardRouter)")

  // allow rewardRouter to mint in blpManager
  await sendTxn(blpManager.setHandler(rewardRouter.address, false), "blpManager.setHandler(rewardRouter)")
  // allow rewardRouter to stake in feeBlpTracker
  await sendTxn(feeBlpTracker.setHandler(rewardRouter.address, false), "feeBlpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in stakedBlpTracker
  await sendTxn(stakedBlpTracker.setHandler(rewardRouter.address, false), "stakedBlpTracker.setHandler(rewardRouter)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
