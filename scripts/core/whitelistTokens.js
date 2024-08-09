const { deployContract, contractAt, sendTxn, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const vault = await contractAt("Vault", "0xA92b6786C7F3634857700aD5816d051357F3648F")
  const vaultPriceFeed = await contractAt("VaultPriceFeed", "0x0A2e77258017f92CebA02732462547e48Cadd4aC")
  console.log("vault", vault.address)
  console.log("vaultPriceFeed", vaultPriceFeed.address)

  const { skl, wbtc, usdt } = tokens
  const tokenArr = [skl, wbtc, usdt]

  for (const token of tokenArr) {
    await sendTxn(vaultPriceFeed.setTokenConfig(
      token.address, // _token
      token.priceFeed, // _priceFeed
      token.priceDecimals, // _priceDecimals
      token.isStrictStable // _isStrictStable
    ), `vaultPriceFeed.setTokenConfig(${token.name}) ${token.address} ${token.priceFeed}`)

  //   await sendTxn(vault.setTokenConfig(
  //     token.address, // _token
  //     token.decimals, // _tokenDecimals
  //     token.tokenWeight, // _tokenWeight
  //     token.minProfitBps, // _minProfitBps
  //     expandDecimals(token.maxUsdgAmount, 18), // _maxUsdgAmount
  //     token.isStable, // _isStable
  //     token.isShortable // _isShortable
  //   ), `vault.setTokenConfig(${token.name}) ${token.address}`)
  // }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
