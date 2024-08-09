const { getFrameSigner, deployContract, contractAt, sendTxn } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues() {
  const signer = await getFrameSigner()

  const esBlu = await contractAt("EsBLU", "0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA")
  const esBluGov = await contractAt("Timelock", await esBlu.gov(), signer)
  const bluVester = await contractAt("Vester", "0x199070DDfd1CFb69173aa2F7e20906F26B363004")
  const bluVesterGov = await contractAt("Timelock", await bluVester.gov(), signer)
  const blpVester = await contractAt("Vester", "0xA75287d2f8b217273E7FCD7E86eF07D33972042E")
  const blpVesterGov = await contractAt("Timelock", await blpVester.gov(), signer)

  return { esBlu, esBluGov, bluVester, bluVesterGov, blpVester, blpVesterGov }
}

async function getAvaxValues() {
  const signer = await getFrameSigner()

  const esBlu = await contractAt("EsBLU", "0xFf1489227BbAAC61a9209A08929E4c2a526DdD17")
  const esBluGov = await contractAt("Timelock", await esBlu.gov(), signer)
  const bluVester = await contractAt("Vester", "0x472361d3cA5F49c8E633FB50385BfaD1e018b445")
  const bluVesterGov = await contractAt("Timelock", await bluVester.gov(), signer)
  const blpVester = await contractAt("Vester", "0x62331A7Bd1dfB3A7642B7db50B5509E57CA3154A")
  const blpVesterGov = await contractAt("Timelock", await blpVester.gov(), signer)

  return { esBlu, esBluGov, bluVester, bluVesterGov, blpVester, blpVesterGov }
}

async function main() {
  const method = network === "arbitrum" ? getArbValues : getAvaxValues
  const { esBlu, esBluGov, bluVester, bluVesterGov, blpVester, blpVesterGov } = await method()

  const esBluBatchSender = await deployContract("EsBluBatchSender", [esBlu.address])

  console.log("esBlu", esBlu.address)
  console.log("esBluGov", esBluGov.address)
  console.log("bluVester", bluVester.address)
  console.log("bluVesterGov", bluVesterGov.address)
  console.log("blpVester", blpVester.address)
  console.log("blpVesterGov", blpVesterGov.address)

  await sendTxn(esBluGov.signalSetHandler(esBlu.address, esBluBatchSender.address, true), "esBluGov.signalSetHandler")
  await sendTxn(bluVesterGov.signalSetHandler(bluVester.address, esBluBatchSender.address, true), "bluVesterGov.signalSetHandler")
  await sendTxn(blpVesterGov.signalSetHandler(blpVester.address, esBluBatchSender.address, true), "blpVesterGov.signalSetHandler")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
