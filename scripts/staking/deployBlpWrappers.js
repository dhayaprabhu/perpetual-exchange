const { getFrameSigner, deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues() {
  const blp = { address: "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258" }
  const blpManager = { address: "0x321F653eED006AD1C29D174e17d96351BDe22649" }
  const stakedBlpTracker = await contractAt("RewardTracker", "0x1aDDD80E6039594eE970E5872D247bf0414C8903")
  const feeBlpTracker = await contractAt("RewardTracker", "0x4e971a87900b931fF39d1Aad67697F49835400b6")

  return { blp, blpManager, stakedBlpTracker, feeBlpTracker }
}

async function getAvaxValues() {
  const blp = { address: "0x01234181085565ed162a948b6a5e88758CD7c7b8" }
  const blpManager = { address: "0xe1ae4d4b06A5Fe1fc288f6B4CD72f9F8323B107F" }
  const stakedBlpTracker = await contractAt("RewardTracker", "0x9e295B5B976a184B14aD8cd72413aD846C299660")
  const feeBlpTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  return { blp, blpManager, stakedBlpTracker, feeBlpTracker }
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
  const signer = await getFrameSigner()
  const { blp, blpManager, stakedBlpTracker, feeBlpTracker } = await getValues()

  const timelock = await contractAt("Timelock", await stakedBlpTracker.gov(), signer)

  const stakedBlp = await deployContract("StakedBlp", [
    blp.address,
    blpManager.address,
    stakedBlpTracker.address,
    feeBlpTracker.address
  ])

  await sendTxn(timelock.signalSetHandler(stakedBlpTracker.address, stakedBlp.address, true), "timelock.signalSetHandler(stakedBlpTracker)")
  await sendTxn(timelock.signalSetHandler(feeBlpTracker.address, stakedBlp.address, true), "timelock.signalSetHandler(stakedBlpTracker)")

  // await deployContract("BlpBalance", [blpManager.address, stakedBlpTracker.address])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
