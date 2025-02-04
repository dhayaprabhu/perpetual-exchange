const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const stakeBluList = require("../../data/stakeBluList.json")

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const { formatEther } = ethers.utils
  const wallet = { address: "0x5F799f365Fa8A2B60ac0429C48B153cA5a6f0Cf8" }
  const blu = await contractAt("BLU", "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a");
  const rewardRouter = await contractAt("RewardRouter", "0x7B01aCf6e7e9CC276e644ac65D770c1131583453")
  const stakedBluTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  const bonusBluTracker = await contractAt("RewardTracker", "0x4d268a7d4C16ceB5a606c173Bd974984343fea13")

  const batchSize = 20

  for (let i = 0; i < stakeBluList.length; i++) {
    const { address, balance } = stakeBluList[i]

    const stakedAmount = await stakedBluTracker.stakedAmounts(address)
    console.log(`${i} ${address}: ${formatEther(balance)}, ${formatEther(stakedAmount)}`)

    if (!stakedAmount.eq(balance)) {
      throw new Error(`Invalid stakedAmount: ${address}, ${formatEther(balance)}, ${formatEther(stakedAmount).toString()}`)
    }

    const pendingRewards = await stakedBluTracker.claimable(address)
    const pendingBonus = await bonusBluTracker.claimable(address)

    console.log(`${address}: ${formatEther(pendingRewards).toString()}, ${formatEther(pendingBonus).toString()}`)

    if (i % batchSize === 0) {
      await sleep(1)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
