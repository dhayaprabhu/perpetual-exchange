const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities");
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function main() {
  const admin = getDeployFilteredInfo("MultiSigner1").imple
  const buffer = 0 // 24 * 60 * 60 //1 day 86400
  const maxTokenSupply = expandDecimals("20000000", 18)

  const { imple: vaultAddr } = getDeployFilteredInfo("Vault")
  const { imple: tokenManagerAddr } = getDeployFilteredInfo("TokenManager")
  const { imple: blpManagerAddr } = getDeployFilteredInfo("BlpManager")
  const { imple: positionRouterAddr } = getDeployFilteredInfo("PositionRouter")
  const { imple: positionManagerAddr } = getDeployFilteredInfo("PositionManager")
  const { imple: bluAddr } = getDeployFilteredInfo("Bluespade")

  const mintReceiverAddr = tokenManagerAddr

  console.log("Timelock", {
    _admin: admin,
    _buffer: buffer,
    _tokenManager: tokenManagerAddr,
    _mintReceiver: mintReceiverAddr,
    _blpManager: blpManagerAddr,
    _maxTokenSupply: maxTokenSupply,
    _marginFeeBasisPoints: 10, // marginFeeBasisPoints 0.1%
    _maxMarginFeeBasisPoints: 500 // maxMarginFeeBasisPoints 5%
  })

  const timelock = await deployContract("Timelock", [{
    _admin: admin,
    _buffer: buffer,
    _tokenManager: tokenManagerAddr,
    _mintReceiver: mintReceiverAddr,
    _blpManager: blpManagerAddr,
    _maxTokenSupply: maxTokenSupply,
    _marginFeeBasisPoints: 10, // marginFeeBasisPoints 0.1%
    _maxMarginFeeBasisPoints: 500 // maxMarginFeeBasisPoints 5%
  }
  ], "Timelock")

  const deployedTimelock = await contractAt("Timelock", timelock.address)

  await sendTxn(deployedTimelock.setShouldToggleIsLeverageEnabled(true), "deployedTimelock.setShouldToggleIsLeverageEnabled(true)")
  await sendTxn(deployedTimelock.setContractHandler(positionRouterAddr, true), "deployedTimelock.setContractHandler(positionRouter)")
  await sendTxn(deployedTimelock.setContractHandler(positionManagerAddr, true), "deployedTimelock.setContractHandler(positionManager)")

  // // update gov of vault
  // const vaultGov = await contractAt("Timelock", await vault.gov())

  // await sendTxn(vaultGov.signalSetGov(vaultAddr, deployedTimelock.address), "vaultGov.signalSetGov")
  // await sendTxn(deployedTimelock.signalSetGov(vaultAddr, vaultGov.address), "deployedTimelock.signalSetGov(vault)")

  const signers = [
    getDeployFilteredInfo("MultiSigner1").imple
  ]

  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i]
    await sendTxn(deployedTimelock.setContractHandler(signer, true), `deployedTimelock.setContractHandler(${signer})`)
  }

  const keepers = [
    getDeployFilteredInfo("MultiSigner1").imple // GMX deployer: avalanche: 0x5F799f365Fa8A2B60ac0429C48B153cA5a6f0Cf8 -> call batchSender
  ]

  for (let i = 0; i < keepers.length; i++) {
    const keeper = keepers[i]
    await sendTxn(deployedTimelock.setKeeper(keeper, true), `deployedTimelock.setKeeper(${keeper})`)
  }

  await sendTxn(deployedTimelock.signalApprove(bluAddr, admin, "1000000000000000000"), "deployedTimelock.signalApprove")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
