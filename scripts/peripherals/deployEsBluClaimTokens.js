const { deployContract, contractAt, writeTmpAddresses } = require("../shared/helpers")

async function main() {
  await deployContract("MintableBaseToken", ["VestingOption", "ARB:BLU", 0])
  await deployContract("MintableBaseToken", ["VestingOption", "ARB:BLP", 0])
  await deployContract("MintableBaseToken", ["VestingOption", "AVAX:BLU", 0])
  await deployContract("MintableBaseToken", ["VestingOption", "AVAX:BLP", 0])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
