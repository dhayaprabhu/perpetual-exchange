const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams")
const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

async function main() {
  const { collateralToken } = tokens

  const vestingDuration = 365 * 24 * 60 * 60

  const blpManager = await contractAt("BlpManager", getDeployFilteredInfo("BlpManager").imple)
  const blp = await contractAt("BLP", getDeployFilteredInfo("BLP").imple)
  const blu = await contractAt("Bluespade", getDeployFilteredInfo("Bluespade").imple);
  const esBlu = await contractAt("EsBLU", getDeployFilteredInfo("EsBLU").imple);
  
  await deployContract("MintableBaseToken", ["Bonus BLU", "bnBLU", 0], undefined, undefined, "BonusBLU");
  const bnBlu = await contractAt("MintableBaseToken", getDeployFilteredInfo("BonusBLU").imple);

  await sendTxn(esBlu.setInPrivateTransferMode(true), "esBlu.setInPrivateTransferMode")
  await sendTxn(blp.setInPrivateTransferMode(true), "blp.setInPrivateTransferMode")

  await deployContract("RewardTracker", ["Staked BLU", "sBLU"], undefined, undefined, "RewardTrackerStakedBLU")
  const stakedBluTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerStakedBLU").imple)
  await deployContract("RewardDistributor", [esBlu.address, stakedBluTracker.address], undefined, undefined, "RewardDistributorStakedBLU")
  const stakedBluDistributor = await contractAt("RewardDistributor", getDeployFilteredInfo("RewardDistributorStakedBLU").imple)
  await sendTxn(stakedBluTracker.initialize([blu.address, esBlu.address], stakedBluDistributor.address), "stakedBluTracker.initialize")
  await sendTxn(stakedBluDistributor.updateLastDistributionTime(), "stakedBluDistributor.updateLastDistributionTime")

  await deployContract("RewardTracker", ["Staked + Bonus BLU", "sbBLU"], undefined, undefined, "RewardTrackerStakedBonusBLU")
  const bonusBluTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerStakedBonusBLU").imple)
  await deployContract("BonusDistributor", [bnBlu.address, bonusBluTracker.address], undefined, undefined, "BonusDistributor")
  const bonusBluDistributor = await contractAt("BonusDistributor", getDeployFilteredInfo("BonusDistributor").imple)
  await sendTxn(bonusBluTracker.initialize([stakedBluTracker.address], bonusBluDistributor.address), "bonusBluTracker.initialize")
  await sendTxn(bonusBluDistributor.updateLastDistributionTime(), "bonusBluDistributor.updateLastDistributionTime")

  await deployContract("RewardTracker", ["Staked + Bonus + Fee BLU", "sbfBLU"], undefined, undefined, "RewardTrackerStakedBonusFeeBLU")
  const feeBluTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerStakedBonusFeeBLU").imple)
  await deployContract("RewardDistributor", [collateralToken.address, feeBluTracker.address], undefined, undefined, "RewardDistributorStakedBonusFeeBLU")
  const feeBluDistributor = await contractAt("RewardDistributor", getDeployFilteredInfo("RewardDistributorStakedBonusFeeBLU").imple)
  await sendTxn(feeBluTracker.initialize([bonusBluTracker.address, bnBlu.address], feeBluDistributor.address), "feeBluTracker.initialize")
  await sendTxn(feeBluDistributor.updateLastDistributionTime(), "feeBluDistributor.updateLastDistributionTime")

  await deployContract("RewardTracker", ["Fee BLP", "fBLP"], undefined, undefined, "RewardTrackerFeeBLP")
  const feeBlpTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerFeeBLP").imple)
  await deployContract("RewardDistributor", [collateralToken.address, feeBlpTracker.address], undefined, undefined, "RewardDistributorFeeBLP")
  const feeBlpDistributor = await contractAt("RewardDistributor", getDeployFilteredInfo("RewardDistributorFeeBLP").imple)
  await sendTxn(feeBlpTracker.initialize([blp.address], feeBlpDistributor.address), "feeBlpTracker.initialize")
  await sendTxn(feeBlpDistributor.updateLastDistributionTime(), "feeBlpDistributor.updateLastDistributionTime")

  await deployContract("RewardTracker", ["Fee + Staked BLP", "fsBLP"], undefined, undefined, "RewardTrackerFeeStakedBLP")
  const stakedBlpTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerFeeStakedBLP").imple)
  await deployContract("RewardDistributor", [esBlu.address, stakedBlpTracker.address], undefined, undefined, "RewardDistributorFeeStakedBLP")
  const stakedBlpDistributor = await contractAt("RewardDistributor", getDeployFilteredInfo("RewardDistributorFeeStakedBLP").imple)
  await sendTxn(stakedBlpTracker.initialize([feeBlpTracker.address], stakedBlpDistributor.address), "stakedBlpTracker.initialize")
  await sendTxn(stakedBlpDistributor.updateLastDistributionTime(), "stakedBlpDistributor.updateLastDistributionTime")
  const superTrader = await contractAt("SuperTrader", getDeployFilteredInfo("SuperTrader").imple)
  await sendTxn(superTrader.setLPTrackerAddress(stakedBlpTracker.address), "superTrader.setLPTrackerAddress")

  await sendTxn(stakedBluTracker.setInPrivateTransferMode(true), "stakedBluTracker.setInPrivateTransferMode")
  await sendTxn(stakedBluTracker.setInPrivateStakingMode(true), "stakedBluTracker.setInPrivateStakingMode")
  await sendTxn(bonusBluTracker.setInPrivateTransferMode(true), "bonusBluTracker.setInPrivateTransferMode")
  await sendTxn(bonusBluTracker.setInPrivateStakingMode(true), "bonusBluTracker.setInPrivateStakingMode")
  await sendTxn(bonusBluTracker.setInPrivateClaimingMode(true), "bonusBluTracker.setInPrivateClaimingMode")
  await sendTxn(feeBluTracker.setInPrivateTransferMode(true), "feeBluTracker.setInPrivateTransferMode")
  await sendTxn(feeBluTracker.setInPrivateStakingMode(true), "feeBluTracker.setInPrivateStakingMode")

  await sendTxn(feeBlpTracker.setInPrivateTransferMode(true), "feeBlpTracker.setInPrivateTransferMode")
  await sendTxn(feeBlpTracker.setInPrivateStakingMode(true), "feeBlpTracker.setInPrivateStakingMode")
  await sendTxn(stakedBlpTracker.setInPrivateTransferMode(true), "stakedBlpTracker.setInPrivateTransferMode")
  await sendTxn(stakedBlpTracker.setInPrivateStakingMode(true), "stakedBlpTracker.setInPrivateStakingMode")

  console.log("bluVester = ", {
    _name: "Vested BLU", // _name
    _symbol: "vBLU", // _symbol
    _vestingDuration: vestingDuration, // _vestingDuration
    _esToken: esBlu.address, // _esToken
    _pairToken: feeBluTracker.address, // _pairToken
    _claimableToken: blu.address, // _claimableToken
    _rewardTracker: stakedBluTracker.address, // _rewardTracker
  })

  await deployContract("Vester", [{
    _name: "Vested BLU", // _name
    _symbol: "vBLU", // _symbol
    _vestingDuration: vestingDuration, // _vestingDuration
    _esToken: esBlu.address, // _esToken
    _pairToken: feeBluTracker.address, // _pairToken
    _claimableToken: blu.address, // _claimableToken
    _rewardTracker: stakedBluTracker.address, // _rewardTracker
  }
  ], undefined, undefined, "VestedBLU")
  const bluVester = await contractAt("Vester", getDeployFilteredInfo("VestedBLU").imple);

  console.log("blpVester = ", {
    _name: "Vested BLP", // _name
    _symbol: "vBLP", // _symbol
     _vestingDuration: vestingDuration, // _vestingDuration
     _esToken: esBlu.address, // _esToken
     _pairToken: stakedBlpTracker.address, // _pairToken
     _claimableToken: blu.address, // _claimableToken
     _rewardTracker: stakedBlpTracker.address, // _rewardTracker
  })

  await deployContract("Vester", [{
    _name: "Vested BLP", // _name
    _symbol: "vBLP", // _symbol
     _vestingDuration: vestingDuration, // _vestingDuration
     _esToken: esBlu.address, // _esToken
     _pairToken: stakedBlpTracker.address, // _pairToken
     _claimableToken: blu.address, // _claimableToken
     _rewardTracker: stakedBlpTracker.address, // _rewardTracker
  }
  ], undefined, undefined, "VestedBLP")
  const blpVester = await contractAt("Vester", getDeployFilteredInfo("VestedBLP").imple);

  await deployContract("RewardRouterV2", [], undefined, undefined, "RewardRouterV2")
  const rewardRouter = await contractAt("RewardRouterV2", getDeployFilteredInfo("RewardRouterV2").imple);

  await sendTxn(rewardRouter.initialize({
    _collateralToken: collateralToken.address,
    _blu: blu.address,
    _esBlu: esBlu.address,
    _bnBlu: bnBlu.address,
    _blp: blp.address,
    _stakedBluTracker: stakedBluTracker.address,
    _bonusBluTracker: bonusBluTracker.address,
    _feeBluTracker: feeBluTracker.address,
    _feeBlpTracker: feeBlpTracker.address,
    _stakedBlpTracker: stakedBlpTracker.address,
    _blpManager: blpManager.address,
    _bluVester: bluVester.address,
    _blpVester: blpVester.address
  }
  ), "rewardRouter.initialize")

  await sendTxn(blpManager.setHandler(rewardRouter.address, true), "blpManager.setHandler(rewardRouter)")

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

  // allow stakedBlpTracker to stake feeBlpTracker
  await sendTxn(feeBlpTracker.setHandler(stakedBlpTracker.address, true), "feeBlpTracker.setHandler(stakedBlpTracker)")
  // allow feeBlpTracker to stake blp
  await sendTxn(blp.setHandler(feeBlpTracker.address, true), "blp.setHandler(feeBlpTracker)")

  // allow rewardRouter to stake in feeBlpTracker
  await sendTxn(feeBlpTracker.setHandler(rewardRouter.address, true), "feeBlpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in stakedBlpTracker
  await sendTxn(stakedBlpTracker.setHandler(rewardRouter.address, true), "stakedBlpTracker.setHandler(rewardRouter)")

  await sendTxn(esBlu.setHandler(rewardRouter.address, true), "esBlu.setHandler(rewardRouter)")
  await sendTxn(esBlu.setHandler(stakedBluDistributor.address, true), "esBlu.setHandler(stakedBluDistributor)")
  await sendTxn(esBlu.setHandler(stakedBlpDistributor.address, true), "esBlu.setHandler(stakedBlpDistributor)")
  await sendTxn(esBlu.setHandler(stakedBlpTracker.address, true), "esBlu.setHandler(stakedBlpTracker)")
  await sendTxn(esBlu.setHandler(bluVester.address, true), "esBlu.setHandler(bluVester)")
  await sendTxn(esBlu.setHandler(blpVester.address, true), "esBlu.setHandler(blpVester)")

  await sendTxn(esBlu.setMinter(bluVester.address, true), "esBlu.setMinter(bluVester)")
  await sendTxn(esBlu.setMinter(blpVester.address, true), "esBlu.setMinter(blpVester)")

  await sendTxn(bluVester.setHandler(rewardRouter.address, true), "bluVester.setHandler(rewardRouter)")
  await sendTxn(blpVester.setHandler(rewardRouter.address, true), "blpVester.setHandler(rewardRouter)")

  await sendTxn(feeBluTracker.setHandler(bluVester.address, true), "feeBluTracker.setHandler(bluVester)")
  await sendTxn(stakedBlpTracker.setHandler(blpVester.address, true), "stakedBlpTracker.setHandler(blpVester)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
