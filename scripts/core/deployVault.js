const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function main() {
  await deployContract("Vault", [])
  const vault = await contractAt("Vault", getDeployFilteredInfo("Vault").imple)

  await deployContract("USDG", [vault.address])
  const usdg = await contractAt("USDG", getDeployFilteredInfo("USDG").imple)

  await deployContract("Router", [vault.address, usdg.address])
  const router = await contractAt("Router", getDeployFilteredInfo("Router").imple)
  // const secondaryPriceFeed = await deployContract("FastPriceFeed", [5 * 60])

  await deployContract("VaultPriceFeed", [])
  const vaultPriceFeed = await contractAt("VaultPriceFeed", getDeployFilteredInfo("VaultPriceFeed").imple)

  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.05 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), "vaultPriceFeed.setPriceSampleSpace")
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")

  await deployContract("BLP", [])
  const blp = await contractAt("BLP", getDeployFilteredInfo("BLP").imple)
  await sendTxn(blp.setInPrivateTransferMode(true), "blp.setInPrivateTransferMode")

  await deployContract("BlpManager", [vault.address, usdg.address, blp.address, 15 * 60])
  const blpManager = await contractAt("BlpManager", getDeployFilteredInfo("BlpManager").imple)

  await sendTxn(blpManager.setInPrivateMode(true), "blpManager.setInPrivateMode")
  await sendTxn(blp.setMinter(blpManager.address, true), "blp.setMinter")
  await sendTxn(usdg.addVault(blpManager.address), "usdg.addVault(blpManager)")

  await sendTxn(vault.initialize(
    router.address, // router
    usdg.address, // usdg
    vaultPriceFeed.address, // priceFeed
    toUsd(2), // liquidationFeeUsd
    100, // fundingRateFactor
    100 // stableFundingRateFactor
  ), "vault.initialize")

  await sendTxn(vault.setFundingRate(60 * 60, 100, 100), "vault.setFundingRate")

  await sendTxn(vault.setInManagerMode(true), "vault.setInManagerMode")
  await sendTxn(vault.setManager(blpManager.address, true), "vault.setManager")

  await sendTxn(vault.setFees(
    10, // _taxBasisPoints
    5, // _stableTaxBasisPoints
    20, // _mintBurnFeeBasisPoints
    20, // _swapFeeBasisPoints
    1, // _stableSwapFeeBasisPoints
    10, // _marginFeeBasisPoints
    toUsd(2), // _liquidationFeeUsd
    24 * 60 * 60, // _minProfitTime
    true // _hasDynamicFees
  ), "vault.setFees")

  await deployContract("VaultErrorController", [])
  const vaultErrorController = await contractAt("VaultErrorController", getDeployFilteredInfo("VaultErrorController").imple)
  await sendTxn(vault.setErrorController(vaultErrorController.address), "vault.setErrorController")
  await sendTxn(vaultErrorController.setErrors(vault.address, errors), "vaultErrorController.setErrors")

  await deployContract("VaultUtils", [vault.address])
  const vaultUtils = await contractAt("VaultUtils", getDeployFilteredInfo("VaultUtils").imple)
  await sendTxn(vault.setVaultUtils(vaultUtils.address), "vault.setVaultUtils")

  await deployContract("SuperTrader", [])
  const superTrader = await contractAt("SuperTrader", getDeployFilteredInfo("SuperTrader").imple)
  await sendTxn(vault.setSuperTrader(superTrader.address), "vault.setSuperTrader")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
