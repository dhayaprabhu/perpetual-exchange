const { deployContract, contractAt, writeTmpAddresses, sendTxn } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams");

async function main() {
  const tokenManager = await deployContract("TokenManager", [1], "TokenManager")

  const signers = [
    getDeployFilteredInfo("MultiSigner1").imple
  ]

  await sendTxn(tokenManager.initialize(signers), "tokenManager.initialize")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
