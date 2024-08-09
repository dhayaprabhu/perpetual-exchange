const { deployContract, contractAt, writeTmpAddresses } = require("../shared/helpers")

async function main() {
  await deployContract("EsBLU", [])
  // await deployContract("BLP", [])
  // await deployContract("MintableBaseToken", ["esBLU IOU", "esBLU:IOU", 0])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
