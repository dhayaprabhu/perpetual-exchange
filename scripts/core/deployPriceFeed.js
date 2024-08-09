const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units");
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const deployerAddr = getDeployFilteredInfo("MultiSigner1").imple

  const { wbtc, usdt } = tokens
  const tokenArr = [wbtc, usdt]
  const fastPriceTokens = [wbtc]

  const priceFeedTimelockAddr = getDeployFilteredInfo("PriceFeedTimelock").imple;

  const updaters = [
    getDeployFilteredInfo("MultiSigner1").imple,
    getDeployFilteredInfo("MultiSigner2").imple
  ];

  const tokenManagerAddr = getDeployFilteredInfo("TokenManager").imple;

  const positionRouter = await contractAt("PositionRouter", getDeployFilteredInfo("PositionRouter").imple)

  await deployContract("FastPriceEvents", [])
  const fastPriceEvents = await contractAt("FastPriceEvents", getDeployFilteredInfo("FastPriceEvents").imple)  

  const signers = [
    getDeployFilteredInfo("MultiSigner1").imple, // coinflipcanada
  ];

  if (fastPriceTokens.find(t => !t.fastPricePrecision)) {
    throw new Error("Invalid price precision")
  }

  if (fastPriceTokens.find(t => !t.maxCumulativeDeltaDiff)) {
    throw new Error("Invalid price maxCumulativeDeltaDiff")
  }

  console.log("FastPriceFeed", {
    _priceDuration: 5 * 60, // _priceDuration
    _maxPriceUpdateDelay: 60 * 60, // _maxPriceUpdateDelay
    _minBlockInterval: 0, // _minBlockInterval
    _maxDeviationBasisPoints: 250, // _maxDeviationBasisPoints
    _fastPriceEvents: fastPriceEvents.address, // _fastPriceEvents
    _tokenManager: deployerAddr, // _tokenManager
    _positionRouter: positionRouter.address
  })

  const fastPriceFeedArgs = [{
    _priceDuration: 5 * 60, // _priceDuration
    _maxPriceUpdateDelay: 60 * 60, // _maxPriceUpdateDelay
    _minBlockInterval: 0, // _minBlockInterval
    _maxDeviationBasisPoints: 250, // _maxDeviationBasisPoints
    _fastPriceEvents: fastPriceEvents.address, // _fastPriceEvents
    _tokenManager: deployerAddr, // _tokenManager
    _positionRouter: positionRouter.address
  }];

  await deployContract("FastPriceFeed", fastPriceFeedArgs)
  const secondaryPriceFeed = await contractAt("FastPriceFeed", getDeployFilteredInfo("FastPriceFeed").imple)

  const vaultPriceFeed = await contractAt("VaultPriceFeed", getDeployFilteredInfo("VaultPriceFeed").imple)

  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.01 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), "vaultPriceFeed.setPriceSampleSpace")
  await sendTxn(vaultPriceFeed.setSecondaryPriceFeed(secondaryPriceFeed.address), "vaultPriceFeed.setSecondaryPriceFeed")
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")

  // if (chainlinkFlags) {
  //   await sendTxn(vaultPriceFeed.setChainlinkFlags(chainlinkFlags.address), "vaultPriceFeed.setChainlinkFlags")
  // }

  for (const [i, tokenItem] of tokenArr.entries()) {
    if (tokenItem.spreadBasisPoints === undefined) { continue }
    await sendTxn(vaultPriceFeed.setSpreadBasisPoints(
      tokenItem.address, // _token
      tokenItem.spreadBasisPoints // _spreadBasisPoints
    ), `vaultPriceFeed.setSpreadBasisPoints(${tokenItem.name}) ${tokenItem.spreadBasisPoints}`)
  }

  for (const token of tokenArr) {
    await sendTxn(vaultPriceFeed.setTokenConfig(
      token.address, // _token
      token.priceFeed, // _priceFeed
      token.priceDecimals, // _priceDecimals
      token.isStrictStable // _isStrictStable
    ), `vaultPriceFeed.setTokenConfig(${token.name}) ${token.address} ${token.priceFeed}`)
  }

  await sendTxn(secondaryPriceFeed.initialize(1, signers, updaters), "secondaryPriceFeed.initialize")
  await sendTxn(secondaryPriceFeed.setTokens(fastPriceTokens.map(t => t.address), fastPriceTokens.map(t => t.fastPricePrecision)), "secondaryPriceFeed.setTokens")
  await sendTxn(secondaryPriceFeed.setVaultPriceFeed(vaultPriceFeed.address), "secondaryPriceFeed.setVaultPriceFeed")
  await sendTxn(secondaryPriceFeed.setMaxTimeDeviation(60 * 60), "secondaryPriceFeed.setMaxTimeDeviation")
  await sendTxn(secondaryPriceFeed.setSpreadBasisPointsIfInactive(20), "secondaryPriceFeed.setSpreadBasisPointsIfInactive")
  await sendTxn(secondaryPriceFeed.setSpreadBasisPointsIfChainError(500), "secondaryPriceFeed.setSpreadBasisPointsIfChainError")
  await sendTxn(secondaryPriceFeed.setMaxCumulativeDeltaDiffs(fastPriceTokens.map(t => t.address), fastPriceTokens.map(t => t.maxCumulativeDeltaDiff)), "secondaryPriceFeed.setMaxCumulativeDeltaDiffs")
  await sendTxn(secondaryPriceFeed.setPriceDataInterval(1 * 60), "secondaryPriceFeed.setPriceDataInterval")

  await sendTxn(positionRouter.setPositionKeeper(secondaryPriceFeed.address, true), "positionRouter.setPositionKeeper(secondaryPriceFeed)")
  await sendTxn(fastPriceEvents.setIsPriceFeed(secondaryPriceFeed.address, true), "fastPriceEvents.setIsPriceFeed")

  await sendTxn(vaultPriceFeed.setIsSecondaryPriceEnabled(false), "vaultPriceFeed.setIsSecondaryPriceEnabled")
  await sendTxn(vaultPriceFeed.setGov(priceFeedTimelockAddr), "vaultPriceFeed.setGov")
  await sendTxn(secondaryPriceFeed.setGov(priceFeedTimelockAddr), "secondaryPriceFeed.setGov")
  await sendTxn(secondaryPriceFeed.setTokenManager(tokenManagerAddr), "secondaryPriceFeed.setTokenManager")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
