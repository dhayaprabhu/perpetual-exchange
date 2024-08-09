const { deployContract, contractAt, sendTxn, readTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

async function main() {
  const {
    nativeToken
  } = tokens

  const weth = await contractAt("Token", nativeToken.address)
  const blu = await contractAt("BLU", "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a")
  const esBlu = await contractAt("EsBLU", "0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA")
  const bnBlu = await contractAt("MintableBaseToken", "0x35247165119B69A40edD5304969560D0ef486921")

  const stakedBluTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  const bonusBluTracker = await contractAt("RewardTracker", "0x4d268a7d4C16ceB5a606c173Bd974984343fea13")
  const feeBluTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  const feeBlpTracker = await contractAt("RewardTracker", "0x4e971a87900b931fF39d1Aad67697F49835400b6")
  const stakedBlpTracker = await contractAt("RewardTracker", "0x1aDDD80E6039594eE970E5872D247bf0414C8903")

  const blp = await contractAt("BLP", "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258")
  const blpManager = await contractAt("BlpManager", "0x321F653eED006AD1C29D174e17d96351BDe22649")

  console.log("blpManager", blpManager.address)

  const rewardRouter = await deployContract("RewardRouter", [])

  await sendTxn(rewardRouter.initialize(
    weth.address,
    blu.address,
    esBlu.address,
    bnBlu.address,
    blp.address,
    stakedBluTracker.address,
    bonusBluTracker.address,
    feeBluTracker.address,
    feeBlpTracker.address,
    stakedBlpTracker.address,
    blpManager.address
  ), "rewardRouter.initialize")

  // allow rewardRouter to stake in stakedBluTracker
  await sendTxn(stakedBluTracker.setHandler(rewardRouter.address, true), "stakedBluTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in bonusBluTracker
  await sendTxn(bonusBluTracker.setHandler(rewardRouter.address, true), "bonusBluTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in feeBluTracker
  await sendTxn(feeBluTracker.setHandler(rewardRouter.address, true), "feeBluTracker.setHandler(rewardRouter)")
  // allow rewardRouter to burn bnBlu
  await sendTxn(bnBlu.setMinter(rewardRouter.address, true), "bnBlu.setMinter(rewardRouter)")

  // allow rewardRouter to mint in blpManager
  await sendTxn(blpManager.setHandler(rewardRouter.address, true), "blpManager.setHandler(rewardRouter)")
  // allow rewardRouter to stake in feeBlpTracker
  await sendTxn(feeBlpTracker.setHandler(rewardRouter.address, true), "feeBlpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in stakedBlpTracker
  await sendTxn(stakedBlpTracker.setHandler(rewardRouter.address, true), "stakedBlpTracker.setHandler(rewardRouter)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
