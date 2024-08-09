const { getFrameSigner, deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const depositFee = 30 // 0.3%

async function main() {
  const { imple: vaultAddr } = getDeployFilteredInfo("Vault");
  // const { imple: timelockAddr } = getDeployFilteredInfo("Timelock");
  const { imple: routerAddr } = getDeployFilteredInfo("Router");
  const { imple: shortsTrackerAddr } = getDeployFilteredInfo("ShortsTracker");
  // const { imple: wethAddr } = getDeployFilteredInfo("WETH");
  const { imple: orderBookAddr } = getDeployFilteredInfo("OrderBook");
  const { imple: referralStorageAddr } = getDeployFilteredInfo("ReferralStorage");
  // const { imple: positionUtilsAddr } = getDeployFilteredInfo("PositionUtils");

  const orderKeepers = [
    { address: "0xe556a2833cd737379765dAac511E80AFBec758D2" } // Wallet address for order executing
  ]
  const liquidators = [
    { address: "0x441525143eA29c71413349a2B2f5b0F4315c0EAb" } // Wallet address for position liquidating
  ]

  const partnerContracts = []

  const positionManagerArgs = [vaultAddr, routerAddr, shortsTrackerAddr, depositFee, orderBookAddr]
  await deployContract("PositionManager", positionManagerArgs)
  const positionManager = await contractAt("PositionManager", getDeployFilteredInfo("PositionManager").imple)

  // positionManager only reads from referralStorage so it does not need to be set as a handler of referralStorage
  if ((await positionManager.referralStorage()).toLowerCase() != referralStorageAddr.toLowerCase()) {
    await sendTxn(positionManager.setReferralStorage(referralStorageAddr), "positionManager.setReferralStorage")
  }
  if (await positionManager.shouldValidateIncreaseOrder()) {
    await sendTxn(positionManager.setShouldValidateIncreaseOrder(false), "positionManager.setShouldValidateIncreaseOrder(false)")
  }

  for (let i = 0; i < orderKeepers.length; i++) {
    const orderKeeper = orderKeepers[i]
    if (!(await positionManager.isOrderKeeper(orderKeeper.address))) {
      await sendTxn(positionManager.setOrderKeeper(orderKeeper.address, true), "positionManager.setOrderKeeper(orderKeeper)")
    }
  }

  for (let i = 0; i < liquidators.length; i++) {
    const liquidator = liquidators[i]
    if (!(await positionManager.isLiquidator(liquidator.address))) {
      await sendTxn(positionManager.setLiquidator(liquidator.address, true), "positionManager.setLiquidator(liquidator)")
    }
  }

  // const timelock = await contractAt("Timelock", timelockAddr)
  // if (!(await timelock.isHandler(positionManager.address))) {
  //   await sendTxn(timelock.setContractHandler(positionManager.address, true), "timelock.setContractHandler(positionManager)")
  // }
  // if (!(await vault.isLiquidator(positionManager.address))) {
  //   await sendTxn(timelock.setLiquidator(vaultAddr, positionManager.address, true), "timelock.setLiquidator(vault, positionManager, true)")
  // }

  const shortsTracker = await contractAt("ShortsTracker", shortsTrackerAddr)
  if (!(await shortsTracker.isHandler(positionManager.address))) {
    await sendTxn(shortsTracker.setHandler(positionManager.address, true), "shortsTracker.setContractHandler(positionManager.address, true)")
  }

  const router = await contractAt("Router", routerAddr)
  if (!(await router.plugins(positionManager.address))) {
    await sendTxn(router.addPlugin(positionManager.address), "router.addPlugin(positionManager)")
  }

  for (let i = 0; i < partnerContracts.length; i++) {
    const partnerContract = partnerContracts[i]
    if (!(await positionManager.isPartner(partnerContract))) {
      await sendTxn(positionManager.setPartner(partnerContract, false), "positionManager.setPartner(partnerContract)")
    }
  }

  const vault = contractAt("Vault", vaultAddr)
  if ((await positionManager.gov()) != (await vault.gov())) {
    await sendTxn(positionManager.setGov(await vault.gov()), "positionManager.setGov")
  }

  console.log("done.")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
