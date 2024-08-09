const { deployContract, contractAt, sendTxn, readCsv } = require("../shared/helpers")
const { expandDecimals, bigNumberify } = require("../../test/shared/utilities")

const path = require('path')
const fs = require('fs')
const parse = require('csv-parse')

const inputDir = path.resolve(__dirname, "../..") + "/data/bonds/"

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const inputFile = inputDir + "2022-09-14_transfers.csv"
const shouldSendTxns = true

async function getArbValues() {
  const esBlu = await contractAt("EsBLU", "0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA")
  const esBluBatchSender = await contractAt("EsBluBatchSender", "0xc3828fa579996090Dc7767E051341338e60207eF")

  const vestWithBluOption = "0x544a6ec142Aa9A7F75235fE111F61eF2EbdC250a"
  const vestWithBlpOption = "0x9d8f6f6eE45275A5Ca3C6f6269c5622b1F9ED515"

  const bluVester = await contractAt("Vester", "0x199070DDfd1CFb69173aa2F7e20906F26B363004")
  const blpVester = await contractAt("Vester", "0xA75287d2f8b217273E7FCD7E86eF07D33972042E")

  return { esBlu, esBluBatchSender, vestWithBluOption, vestWithBlpOption, bluVester, blpVester }
}

async function getAvaxValues() {
  const esBlu = await contractAt("EsBLU", "0xFf1489227BbAAC61a9209A08929E4c2a526DdD17")
  const esBluBatchSender = await contractAt("EsBluBatchSender", "0xc9baFef924159138697e72899a2753a3Dc8D1F4d")
  const vestWithBluOption = "0x171a321A78dAE0CDC0Ba3409194df955DEEcA746"
  const vestWithBlpOption = "0x28863Dd19fb52DF38A9f2C6dfed40eeB996e3818"

  const bluVester = await contractAt("Vester", "0x472361d3cA5F49c8E633FB50385BfaD1e018b445")
  const blpVester = await contractAt("Vester", "0x62331A7Bd1dfB3A7642B7db50B5509E57CA3154A")

  return { esBlu, esBluBatchSender, vestWithBluOption, vestWithBlpOption, bluVester, blpVester }
}

async function main() {
  const wallet = { address: "0x5F799f365Fa8A2B60ac0429C48B153cA5a6f0Cf8" }

  const values = network === "arbitrum" ? await getArbValues() : await getAvaxValues()
  const { esBlu, esBluBatchSender, vestWithBluOption, vestWithBlpOption, bluVester, blpVester } = values

  const txns = await readCsv(inputFile)
  console.log("processing list", txns.length)

  const vestWithBluAccounts = []
  const vestWithBluAmounts = []

  const vestWithBlpAccounts = []
  const vestWithBlpAmounts = []

  let totalEsBlu = bigNumberify(0)

  for (let i = 0; i < txns.length; i++) {
    const txn = txns[i]
    if (txn.Method !== "Transfer") {
      continue
    }

    const amount = ethers.utils.parseUnits(txn.Quantity, 18)

    if (txn.To.toLowerCase() === vestWithBluOption.toLowerCase()) {
      vestWithBluAccounts.push(txn.From)
      vestWithBluAmounts.push(amount)
      totalEsBlu = totalEsBlu.add(amount)
    }

    if (txn.To.toLowerCase() === vestWithBlpOption.toLowerCase()) {
      vestWithBlpAccounts.push(txn.From)
      vestWithBlpAmounts.push(amount)
      totalEsBlu = totalEsBlu.add(amount)
    }
  }

  console.log("vestWithBluAccounts", vestWithBluAccounts.length)
  console.log("vestWithBlpAccounts", vestWithBlpAccounts.length)
  console.log("totalEsBlu", totalEsBlu.toString(), ethers.utils.formatUnits(totalEsBlu, 18))

  if (shouldSendTxns) {
    if (vestWithBluAccounts.length > 0) {
      await sendTxn(esBluBatchSender.send(bluVester.address, 4, vestWithBluAccounts, vestWithBluAmounts), "esBluBatchSender.send(bluVester)")
    }
    if (vestWithBlpAccounts.length > 0) {
      await sendTxn(esBluBatchSender.send(blpVester.address, 320, vestWithBlpAccounts, vestWithBlpAmounts), "esBluBatchSender.send(blpVester)")
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
