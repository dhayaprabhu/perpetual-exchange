const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units");
const { getArgumentForSignature } = require("typechain");
const { getDeployFilteredInfo } = require("../shared/syncParams");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const vaultAddr = getDeployFilteredInfo("Vault").imple;
  const govAddr = getDeployFilteredInfo("MultiSigner1").imple;

  await deployContract("ShortsTracker", [vaultAddr], "ShortsTracker")
  const shortsTracker = await contractAt("ShortsTracker", vaultAddr)
  await sendTxn(shortsTracker.setGov(govAddr), "shortsTracker.setGov")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
