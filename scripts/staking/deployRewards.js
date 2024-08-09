const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const wallet = { address: "0x5F799f365Fa8A2B60ac0429C48B153cA5a6f0Cf8" }
  const { AddressZero } = ethers.constants

  const weth = { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" }
  const blu = await deployContract("BLU", []);
  const esBlu = await deployContract("EsBLU", []);
  const bnBlu = await deployContract("MintableBaseToken", ["Bonus BLU", "bnBLU", 0]);
  const bnAlp = { address: AddressZero }
  const alp = { address: AddressZero }

  const stakedBluTracker = await deployContract("RewardTracker", ["Staked BLU", "sBLU"])
  const stakedBluDistributor = await deployContract("RewardDistributor", [esBlu.address, stakedBluTracker.address])
  await sendTxn(stakedBluTracker.initialize([blu.address, esBlu.address], stakedBluDistributor.address), "stakedBluTracker.initialize")
  await sendTxn(stakedBluDistributor.updateLastDistributionTime(), "stakedBluDistributor.updateLastDistributionTime")

  const bonusBluTracker = await deployContract("RewardTracker", ["Staked + Bonus BLU", "sbBLU"])
  const bonusBluDistributor = await deployContract("BonusDistributor", [bnBlu.address, bonusBluTracker.address])
  await sendTxn(bonusBluTracker.initialize([stakedBluTracker.address], bonusBluDistributor.address), "bonusBluTracker.initialize")
  await sendTxn(bonusBluDistributor.updateLastDistributionTime(), "bonusBluDistributor.updateLastDistributionTime")

  const feeBluTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee BLU", "sbfBLU"])
  const feeBluDistributor = await deployContract("RewardDistributor", [weth.address, feeBluTracker.address])
  await sendTxn(feeBluTracker.initialize([bonusBluTracker.address, bnBlu.address], feeBluDistributor.address), "feeBluTracker.initialize")
  await sendTxn(feeBluDistributor.updateLastDistributionTime(), "feeBluDistributor.updateLastDistributionTime")

  const feeBlpTracker = { address: AddressZero }
  const stakedBlpTracker = { address: AddressZero }

  const stakedAlpTracker = { address: AddressZero }
  const bonusAlpTracker = { address: AddressZero }
  const feeAlpTracker = { address: AddressZero }

  const blpManager = { address: AddressZero }
  const blp = { address: AddressZero }

  await sendTxn(stakedBluTracker.setInPrivateTransferMode(true), "stakedBluTracker.setInPrivateTransferMode")
  await sendTxn(stakedBluTracker.setInPrivateStakingMode(true), "stakedBluTracker.setInPrivateStakingMode")
  await sendTxn(bonusBluTracker.setInPrivateTransferMode(true), "bonusBluTracker.setInPrivateTransferMode")
  await sendTxn(bonusBluTracker.setInPrivateStakingMode(true), "bonusBluTracker.setInPrivateStakingMode")
  await sendTxn(bonusBluTracker.setInPrivateClaimingMode(true), "bonusBluTracker.setInPrivateClaimingMode")
  await sendTxn(feeBluTracker.setInPrivateTransferMode(true), "feeBluTracker.setInPrivateTransferMode")
  await sendTxn(feeBluTracker.setInPrivateStakingMode(true), "feeBluTracker.setInPrivateStakingMode")

  const rewardRouter = await deployContract("RewardRouter", [])

  await sendTxn(rewardRouter.initialize(
    blu.address,
    esBlu.address,
    bnBlu.address,
    bnAlp.address,
    blp.address,
    alp.address,
    stakedBluTracker.address,
    bonusBluTracker.address,
    feeBluTracker.address,
    feeBlpTracker.address,
    stakedBlpTracker.address,
    stakedAlpTracker.address,
    bonusAlpTracker.address,
    feeAlpTracker.address,
    blpManager.address
  ), "rewardRouter.initialize")

  // allow rewardRouter to stake in stakedBluTracker
  await sendTxn(stakedBluTracker.setHandler(rewardRouter.address, true), "stakedBluTracker.setHandler(rewardRouter)")
  // allow bonusBluTracker to stake stakedBluTracker
  await sendTxn(stakedBluTracker.setHandler(bonusBluTracker.address, true), "stakedBluTracker.setHandler(bonusBluTracker)")
  // allow rewardRouter to stake in bonusBluTracker
  await sendTxn(bonusBluTracker.setHandler(rewardRouter.address, true), "bonusBluTracker.setHandler(rewardRouter)")
  // allow bonusBluTracker to stake feeBluTracker
  await sendTxn(bonusBluTracker.setHandler(feeBluTracker.address, true), "bonusBluTracker.setHandler(feeBluTracker)")
  await sendTxn(bonusBluDistributor.setBonusMultiplier(10000), "bonusBluDistributor.setBonusMultiplier")
  // allow rewardRouter to stake in feeBluTracker
  await sendTxn(feeBluTracker.setHandler(rewardRouter.address, true), "feeBluTracker.setHandler(rewardRouter)")
  // allow stakedBluTracker to stake esBlu
  await sendTxn(esBlu.setHandler(stakedBluTracker.address, true), "esBlu.setHandler(stakedBluTracker)")
  // allow feeBluTracker to stake bnBlu
  await sendTxn(bnBlu.setHandler(feeBluTracker.address, true), "bnBlu.setHandler(feeBluTracker")
  // allow rewardRouter to burn bnBlu
  await sendTxn(bnBlu.setMinter(rewardRouter.address, true), "bnBlu.setMinter(rewardRouter")

  // mint esBlu for distributors
  await sendTxn(esBlu.setMinter(wallet.address, true), "esBlu.setMinter(wallet)")
  await sendTxn(esBlu.mint(stakedBluDistributor.address, expandDecimals(50000 * 12, 18)), "esBlu.mint(stakedBluDistributor") // ~50,000 BLU per month
  await sendTxn(stakedBluDistributor.setTokensPerInterval("20667989410000000"), "stakedBluDistributor.setTokensPerInterval") // 0.02066798941 esBlu per second

  // mint bnBlu for distributor
  await sendTxn(bnBlu.setMinter(wallet.address, true), "bnBlu.setMinter")
  await sendTxn(bnBlu.mint(bonusBluDistributor.address, expandDecimals(15 * 1000 * 1000, 18)), "bnBlu.mint(bonusBluDistributor)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
