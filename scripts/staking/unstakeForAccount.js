const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const wallet = { address: "0x5F799f365Fa8A2B60ac0429C48B153cA5a6f0Cf8" }

  const account = "0x6eA748d14f28778495A3fBa3550a6CdfBbE555f9"
  const unstakeAmount = "79170000000000000000"

  const rewardRouter = await contractAt("RewardRouter", "0x1b8911995ee36F4F95311D1D9C1845fA18c56Ec6")
  const blu = await contractAt("BLU", "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a");
  const bnBlu = await contractAt("MintableBaseToken", "0x35247165119B69A40edD5304969560D0ef486921");
  const stakedBluTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  const bonusBluTracker = await contractAt("RewardTracker", "0x4d268a7d4C16ceB5a606c173Bd974984343fea13")
  const feeBluTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  // const gasLimit = 30000000

  // await sendTxn(feeBluTracker.setHandler(wallet.address, true, { gasLimit }), "feeBluTracker.setHandler")
  // await sendTxn(bonusBluTracker.setHandler(wallet.address, true, { gasLimit }), "bonusBluTracker.setHandler")
  // await sendTxn(stakedBluTracker.setHandler(wallet.address, true, { gasLimit }), "stakedBluTracker.setHandler")

  const stakedAmount = await stakedBluTracker.stakedAmounts(account)
  console.log(`${account} staked: ${stakedAmount.toString()}`)
  console.log(`unstakeAmount: ${unstakeAmount.toString()}`)

  await sendTxn(feeBluTracker.unstakeForAccount(account, bonusBluTracker.address, unstakeAmount, account), "feeBluTracker.unstakeForAccount")
  await sendTxn(bonusBluTracker.unstakeForAccount(account, stakedBluTracker.address, unstakeAmount, account), "bonusBluTracker.unstakeForAccount")
  await sendTxn(stakedBluTracker.unstakeForAccount(account, blu.address, unstakeAmount, account), "stakedBluTracker.unstakeForAccount")

  await sendTxn(bonusBluTracker.claimForAccount(account, account), "bonusBluTracker.claimForAccount")

  const bnBluAmount = await bnBlu.balanceOf(account)
  console.log(`bnBluAmount: ${bnBluAmount.toString()}`)

  await sendTxn(feeBluTracker.stakeForAccount(account, account, bnBlu.address, bnBluAmount), "feeBluTracker.stakeForAccount")

  const stakedBnBlu = await feeBluTracker.depositBalances(account, bnBlu.address)
  console.log(`stakedBnBlu: ${stakedBnBlu.toString()}`)

  const reductionAmount = stakedBnBlu.mul(unstakeAmount).div(stakedAmount)
  console.log(`reductionAmount: ${reductionAmount.toString()}`)
  await sendTxn(feeBluTracker.unstakeForAccount(account, bnBlu.address, reductionAmount, account), "feeBluTracker.unstakeForAccount")
  await sendTxn(bnBlu.burn(account, reductionAmount), "bnBlu.burn")

  const bluAmount = await blu.balanceOf(account)
  console.log(`bluAmount: ${bluAmount.toString()}`)

  await sendTxn(blu.burn(account, unstakeAmount), "blu.burn")
  const nextBluAmount = await blu.balanceOf(account)
  console.log(`nextBluAmount: ${nextBluAmount.toString()}`)

  const nextStakedAmount = await stakedBluTracker.stakedAmounts(account)
  console.log(`nextStakedAmount: ${nextStakedAmount.toString()}`)

  const nextStakedBnBlu = await feeBluTracker.depositBalances(account, bnBlu.address)
  console.log(`nextStakedBnBlu: ${nextStakedBnBlu.toString()}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
