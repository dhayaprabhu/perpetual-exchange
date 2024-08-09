const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const vault = await contractAt("Vault", getDeployFilteredInfo("Vault").imple)

  const { wbtc, usdt } = tokens
  const tokenArr = [wbtc, usdt]

  const vaultGov = await vault.gov()

  const vaultTimelock = await contractAt("Timelock", vaultGov)
  // const vaultMethod = "signalVaultSetTokenConfig"
  const vaultMethod = "vaultSetTokenConfig"

  console.log("vault", vault.address)
  console.log("vaultTimelock", vaultTimelock.address)
  console.log("vaultMethod", vaultMethod)

  for (const token of tokenArr) {
    await sendTxn(vaultTimelock[vaultMethod](
      vault.address,
      token.address, // _token
      token.decimals, // _tokenDecimals
      token.tokenWeight, // _tokenWeight
      token.minProfitBps, // _minProfitBps
      expandDecimals(token.maxUsdgAmount, 18), // _maxUsdgAmount
      token.isStable, // _isStable
      token.isShortable // _isShortable
    ), `vault.${vaultMethod}(${token.name}) ${token.address}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
