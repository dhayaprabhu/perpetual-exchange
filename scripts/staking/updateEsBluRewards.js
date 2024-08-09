const { deployContract, contractAt, sendTxn, signers, updateTokensPerInterval } = require("../shared/helpers")
const { expandDecimals, bigNumberify } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const shouldSendTxn = true

const monthlyEsBluForBlpOnSkale = expandDecimals(toInt("20000"), 18)

async function getStakedAmounts() {
  // const arbStakedBluTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4", signers.arbitrum)
  // const arbStakedBluAndEsBlu =await arbStakedBluTracker.totalSupply()

  // const avaxStakedBluTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4", signers.avax)
  // const avaxStakedBluAndEsBlu =await avaxStakedBluTracker.totalSupply()

  const skaleStakedBluTracker = await contractAt("RewardTracker", "0xb710f0d97023340eb3fabc4259feadf3bbeddf05", signers.skale)
  const skaleStakedBluAndEsBlu =await skaleStakedBluTracker.totalSupply()

  return {
    // arbStakedBluAndEsBlu,
    // avaxStakedBluAndEsBlu,
    skaleStakedBluAndEsBlu
  }
}

async function getSkaleValues() {
  const bluRewardTracker = await contractAt("RewardTracker", "0xb710f0d97023340eb3fabc4259feadf3bbeddf05")
  const blpRewardTracker = await contractAt("RewardTracker", "0x5d6fe7c8af331d2f9736922984056214fb3cc763")
  const tokenDecimals = 18
  const monthlyEsBluForBlp = monthlyEsBluForBlpOnSkale

  return { tokenDecimals, bluRewardTracker, blpRewardTracker, monthlyEsBluForBlp }
}

function getValues() {
  if (network === "skale") {
    return getSkaleValues()
  }
}

function toInt(value) {
  return parseInt(value.replaceAll(",", ""))
}

async function main() {
  const { skaleStakedBluAndEsBlu } = await getStakedAmounts()
  console.log("skaleStakedBluAndEsBlu = ", skaleStakedBluAndEsBlu)
  const { tokenDecimals, bluRewardTracker, blpRewardTracker, monthlyEsBluForBlp } = await getValues()

  const stakedAmounts = {
    skale: {
      total: skaleStakedBluAndEsBlu
    }
  }

  let totalStaked = bigNumberify(0)

  for (const net in stakedAmounts) {
    totalStaked = totalStaked.add(stakedAmounts[net].total)
  }

  const totalEsBluRewards = expandDecimals(50000, tokenDecimals)
  const secondsPerMonth = 28 * 24 * 60 * 60

  const bluRewardDistributor = await contractAt("RewardDistributor", await bluRewardTracker.distributor())

  const bluCurrentTokensPerInterval = await bluRewardDistributor.tokensPerInterval()
  const bluNextTokensPerInterval = totalEsBluRewards.mul(stakedAmounts[network].total).div(totalStaked).div(secondsPerMonth)
  const bluDelta = bluNextTokensPerInterval.sub(bluCurrentTokensPerInterval).mul(10000).div(bluCurrentTokensPerInterval)

  console.log("bluCurrentTokensPerInterval", bluCurrentTokensPerInterval.toString())
  console.log("bluNextTokensPerInterval", bluNextTokensPerInterval.toString(), `${bluDelta.toNumber() / 100.00}%`)

  const blpRewardDistributor = await contractAt("RewardDistributor", await blpRewardTracker.distributor())

  const blpCurrentTokensPerInterval = await blpRewardDistributor.tokensPerInterval()
  const blpNextTokensPerInterval = monthlyEsBluForBlp.div(secondsPerMonth)

  console.log("blpCurrentTokensPerInterval", blpCurrentTokensPerInterval.toString())
  console.log("blpNextTokensPerInterval", blpNextTokensPerInterval.toString())

  if (shouldSendTxn) {
    await updateTokensPerInterval(bluRewardDistributor, bluNextTokensPerInterval, "bluRewardDistributor")
    await updateTokensPerInterval(blpRewardDistributor, blpNextTokensPerInterval, "blpRewardDistributor")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
