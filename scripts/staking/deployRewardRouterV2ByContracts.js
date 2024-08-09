const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const { nativeToken } = tokens

  const vestingDuration = 365 * 24 * 60 * 60

  const blpManager = await contractAt("BlpManager", "0x3a417b2949d59B129e5C6c0A52114335C780B9AE")
  const blp = await contractAt("BLP", "0xA63FbC76dDaf2F800B3699a4a46C5f260E04050C")

  const blu = await contractAt("Bluespade", "0x39E1Da9a034Fd5ADba01C7F6cFA8B5dE16dD908c");
  const esBlu = await contractAt("EsBLU", "0x6CdEf99C74CcF3FA65211fF547Be5dDB4A73770C");
  // const bnBlu = await deployContract("MintableBaseToken", ["Bonus BLU", "bnBLU", 0]);
  const bnBlu = await contractAt("MintableBaseToken", "0x6e29e6db1Ea778fCC17BA575C8fB22A4dfeAE08f");


  // await sendTxn(esBlu.setInPrivateTransferMode(true), "esBlu.setInPrivateTransferMode")
  // await sendTxn(blp.setInPrivateTransferMode(true), "blp.setInPrivateTransferMode")

  // const stakedBluTracker = await deployContract("RewardTracker", ["Staked BLU", "sBLU"])
  const stakedBluTracker = await contractAt("RewardTracker", "0x48d7f4529f6149c5EB96AeF38534b90AD7562b4d")
  // const stakedBluDistributor = await deployContract("RewardDistributor", [esBlu.address, stakedBluTracker.address])
  const stakedBluDistributor = await contractAt("RewardDistributor", "0x4e11F35A9c226be709078787cC44375FD7c22424")

  // await sendTxn(stakedBluTracker.initialize([blu.address, esBlu.address], stakedBluDistributor.address), "stakedBluTracker.initialize")
  // await sendTxn(stakedBluDistributor.updateLastDistributionTime(), "stakedBluDistributor.updateLastDistributionTime")

  // const bonusBluTracker = await deployContract("RewardTracker", ["Staked + Bonus BLU", "sbBLU"])
  const bonusBluTracker = await contractAt("RewardTracker", "0xC5fcC14560781C4c9FD55d7466d781539177A3a4")

  // const bonusBluDistributor = await deployContract("BonusDistributor", [bnBlu.address, bonusBluTracker.address])
  const bonusBluDistributor = await contractAt("BonusDistributor", "0x667Af1B5Cb7b86107B0B9BEa3AE3C44506E1d8Ce")

  // await sendTxn(bonusBluTracker.initialize([stakedBluTracker.address], bonusBluDistributor.address), "bonusBluTracker.initialize")
  // await sendTxn(bonusBluDistributor.updateLastDistributionTime(), "bonusBluDistributor.updateLastDistributionTime")

  // const feeBluTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee BLU", "sbfBLU"])
  const feeBluTracker = await contractAt("RewardTracker", "0xb31018C29500a565e511a0800dA87e1457CdE9b1")

  // const feeBluDistributor = await deployContract("RewardDistributor", [nativeToken.address, feeBluTracker.address])
  const feeBluDistributor = await contractAt("RewardDistributor", "0xd04EA0a03850786b7d057Ac668A3ab9B3E00199D")

  // await sendTxn(feeBluTracker.initialize([bonusBluTracker.address, bnBlu.address], feeBluDistributor.address), "feeBluTracker.initialize")
  // await sendTxn(feeBluDistributor.updateLastDistributionTime(), "feeBluDistributor.updateLastDistributionTime")

  // const feeBlpTracker = await deployContract("RewardTracker", ["Fee BLP", "fBLP"])
  const feeBlpTracker = await contractAt("RewardTracker", "0x82b84dc1A46D43747496E62BBEE2c70Ef8EE4EAD")

  // const feeBlpDistributor = await deployContract("RewardDistributor", [nativeToken.address, feeBlpTracker.address])
  const feeBlpDistributor = await contractAt("RewardDistributor", "0x6445024BFA34a160714d0099D7F24f0b19Bb3C0c")

  // await sendTxn(feeBlpTracker.initialize([blp.address], feeBlpDistributor.address), "feeBlpTracker.initialize")
  // await sendTxn(feeBlpDistributor.updateLastDistributionTime(), "feeBlpDistributor.updateLastDistributionTime")

  // const stakedBlpTracker = await deployContract("RewardTracker", ["Fee + Staked BLP", "fsBLP"])
  const stakedBlpTracker = await contractAt("RewardTracker", "0x8b498C45465f4a7e9CEc0D12Aa6a695A6b563A34")

  // const stakedBlpDistributor = await deployContract("RewardDistributor", [esBlu.address, stakedBlpTracker.address])
  const stakedBlpDistributor = await contractAt("RewardDistributor", "0x7ed80C511359db0E34e2FbF14aB12Ee9AfAB0Baa")
  // await sendTxn(stakedBlpTracker.initialize([feeBlpTracker.address], stakedBlpDistributor.address), "stakedBlpTracker.initialize")
  // await sendTxn(stakedBlpDistributor.updateLastDistributionTime(), "stakedBlpDistributor.updateLastDistributionTime")

  // await sendTxn(stakedBluTracker.setInPrivateTransferMode(true), "stakedBluTracker.setInPrivateTransferMode")
  // await sendTxn(stakedBluTracker.setInPrivateStakingMode(true), "stakedBluTracker.setInPrivateStakingMode")
  // await sendTxn(bonusBluTracker.setInPrivateTransferMode(true), "bonusBluTracker.setInPrivateTransferMode")
  // await sendTxn(bonusBluTracker.setInPrivateStakingMode(true), "bonusBluTracker.setInPrivateStakingMode")
  // await sendTxn(bonusBluTracker.setInPrivateClaimingMode(true), "bonusBluTracker.setInPrivateClaimingMode")
  // await sendTxn(feeBluTracker.setInPrivateTransferMode(true), "feeBluTracker.setInPrivateTransferMode")
  // await sendTxn(feeBluTracker.setInPrivateStakingMode(true), "feeBluTracker.setInPrivateStakingMode")

  // await sendTxn(feeBlpTracker.setInPrivateTransferMode(true), "feeBlpTracker.setInPrivateTransferMode")
  // await sendTxn(feeBlpTracker.setInPrivateStakingMode(true), "feeBlpTracker.setInPrivateStakingMode")
  // await sendTxn(stakedBlpTracker.setInPrivateTransferMode(true), "stakedBlpTracker.setInPrivateTransferMode")
  // await sendTxn(stakedBlpTracker.setInPrivateStakingMode(true), "stakedBlpTracker.setInPrivateStakingMode")

  // const bluVester = await deployContract("Vester", [
  //   "Vested BLU", // _name
  //   "vBLU", // _symbol
  //   vestingDuration, // _vestingDuration
  //   esBlu.address, // _esToken
  //   feeBluTracker.address, // _pairToken
  //   blu.address, // _claimableToken
  //   stakedBluTracker.address, // _rewardTracker
  // ])
  const bluVester = await contractAt("Vester", "0x957C9a17fc5A5Fda190D1Bc4Fc1AF2B6282C2743")
  //
  // const blpVester = await deployContract("Vester", [
  //   "Vested BLP", // _name
  //   "vBLP", // _symbol
  //   vestingDuration, // _vestingDuration
  //   esBlu.address, // _esToken
  //   stakedBlpTracker.address, // _pairToken
  //   blu.address, // _claimableToken
  //   stakedBlpTracker.address, // _rewardTracker
  // ])
  const blpVester = await contractAt("Vester", "0xcf920DC4df556267A82783c4647cbe9Ce55cB1A2")
  // const rewardRouter = await deployContract("RewardRouterV2", [])
  const rewardRouter = await contractAt("RewardRouterV2", "0x0AB63435EbA15CCedb44d86Cf3e2f1d8DBeB9e08")

  // await sendTxn(rewardRouter.initialize(
  //   nativeToken.address,
  //   blu.address,
  //   esBlu.address,
  //   bnBlu.address,
  //   blp.address,
  //   stakedBluTracker.address,
  //   bonusBluTracker.address,
  //   feeBluTracker.address,
  //   feeBlpTracker.address,
  //   stakedBlpTracker.address,
  //   blpManager.address,
  //   bluVester.address,
  //   blpVester.address
  // ), "rewardRouter.initialize")

  await sendTxn(blpManager.setHandler(rewardRouter.address, true), "blpManager.setHandler(rewardRouter)")
  await sleep(15000)
  // allow rewardRouter to stake in stakedBluTracker
  await sendTxn(stakedBluTracker.setHandler(rewardRouter.address, true), "stakedBluTracker.setHandler(rewardRouter)")
  await sleep(15000)
  // allow bonusBluTracker to stake stakedBluTracker
  await sendTxn(stakedBluTracker.setHandler(bonusBluTracker.address, true), "stakedBluTracker.setHandler(bonusBluTracker)")
  await sleep(15000)
  // allow rewardRouter to stake in bonusBluTracker
  await sendTxn(bonusBluTracker.setHandler(rewardRouter.address, true), "bonusBluTracker.setHandler(rewardRouter)")
  await sleep(15000)
  // allow bonusBluTracker to stake feeBluTracker
  await sendTxn(bonusBluTracker.setHandler(feeBluTracker.address, true), "bonusBluTracker.setHandler(feeBluTracker)")
  await sleep(15000)
  await sendTxn(bonusBluDistributor.setBonusMultiplier(10000), "bonusBluDistributor.setBonusMultiplier")
  await sleep(15000)
  // allow rewardRouter to stake in feeBluTracker
  await sendTxn(feeBluTracker.setHandler(rewardRouter.address, true), "feeBluTracker.setHandler(rewardRouter)")
  await sleep(15000)
  // allow stakedBluTracker to stake esBlu
  await sendTxn(esBlu.setHandler(stakedBluTracker.address, true), "esBlu.setHandler(stakedBluTracker)")
  await sleep(15000)
  // allow feeBluTracker to stake bnBlu
  await sendTxn(bnBlu.setHandler(feeBluTracker.address, true), "bnBlu.setHandler(feeBluTracker")
  await sleep(15000)
  // allow rewardRouter to burn bnBlu
  await sendTxn(bnBlu.setMinter(rewardRouter.address, true), "bnBlu.setMinter(rewardRouter")
  await sleep(15000)

  // allow stakedBlpTracker to stake feeBlpTracker
  await sendTxn(feeBlpTracker.setHandler(stakedBlpTracker.address, true), "feeBlpTracker.setHandler(stakedBlpTracker)")
  await sleep(15000)
  // allow feeBlpTracker to stake blp
  await sendTxn(blp.setHandler(feeBlpTracker.address, true), "blp.setHandler(feeBlpTracker)")
  await sleep(15000)

  // allow rewardRouter to stake in feeBlpTracker
  await sendTxn(feeBlpTracker.setHandler(rewardRouter.address, true), "feeBlpTracker.setHandler(rewardRouter)")
  await sleep(15000)
  // allow rewardRouter to stake in stakedBlpTracker
  await sendTxn(stakedBlpTracker.setHandler(rewardRouter.address, true), "stakedBlpTracker.setHandler(rewardRouter)")
  await sleep(15000)

  await sendTxn(esBlu.setHandler(rewardRouter.address, true), "esBlu.setHandler(rewardRouter)")
  await sleep(15000)
  await sendTxn(esBlu.setHandler(stakedBluDistributor.address, true), "esBlu.setHandler(stakedBluDistributor)")
  await sleep(15000)
  await sendTxn(esBlu.setHandler(stakedBlpDistributor.address, true), "esBlu.setHandler(stakedBlpDistributor)")
  await sleep(15000)
  await sendTxn(esBlu.setHandler(stakedBlpTracker.address, true), "esBlu.setHandler(stakedBlpTracker)")
  await sleep(15000)
  await sendTxn(esBlu.setHandler(bluVester.address, true), "esBlu.setHandler(bluVester)")
  await sleep(15000)
  await sendTxn(esBlu.setHandler(blpVester.address, true), "esBlu.setHandler(blpVester)")
  await sleep(15000)

  await sendTxn(esBlu.setMinter(bluVester.address, true), "esBlu.setMinter(bluVester)")
  await sleep(15000)
  await sendTxn(esBlu.setMinter(blpVester.address, true), "esBlu.setMinter(blpVester)")
  await sleep(15000)

  await sendTxn(bluVester.setHandler(rewardRouter.address, true), "bluVester.setHandler(rewardRouter)")
  await sleep(15000)
  await sendTxn(blpVester.setHandler(rewardRouter.address, true), "blpVester.setHandler(rewardRouter)")
  await sleep(15000)

  await sendTxn(feeBluTracker.setHandler(bluVester.address, true), "feeBluTracker.setHandler(bluVester)")
  await sleep(15000)
  await sendTxn(stakedBlpTracker.setHandler(blpVester.address, true), "stakedBlpTracker.setHandler(blpVester)")
  await sleep(15000)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
