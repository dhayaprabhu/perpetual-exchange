const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

async function main() {

  // const blueBet = await deployContract("BlueBet", []);
  const blueBet = await contractAt("BlueBet", "0x355dE8a8Cc60E18d6Db4eB2B70A6dC52707C3AC9")

  // await sendTxn(blueBet.setBettingKeeper("0xb8E2408cCCcE6F8396245e5C84F52BCC8985cE9D", true), "blueBet.setBettingKeeper")

  // await sendTxn(blueBet.setDepositToken("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"), "blueBet.setDepositToken USDC")

  // await sendTxn(blueBet.setTeamAddress("0xb8E2408cCCcE6F8396245e5C84F52BCC8985cE9D"), "blueBet.setTeamAddress")

  await sendTxn(blueBet.setCommunityCount(8), "blueBet.setCommunityCount")
  
  // await sendTxn(blueBet.setCommunityAddress(0, "0xb8E2408cCCcE6F8396245e5C84F52BCC8985cE9D"), "blueBet.setCommunityAddress") //Bluespade
  // await sendTxn(blueBet.setCommunityAddress(1, "0xb8E2408cCCcE6F8396245e5C84F52BCC8985cE9D"), "blueBet.setCommunityAddress") //Raijins
  // await sendTxn(blueBet.setCommunityAddress(2, "0xb8E2408cCCcE6F8396245e5C84F52BCC8985cE9D"), "blueBet.setCommunityAddress") //Bluebet
  // await sendTxn(blueBet.setCommunityAddress(3, "0x687AaCDe22D3425fE5D0054b289873815E531fa8"), "blueBet.setCommunityAddress") //Factions NFT
  // await sendTxn(blueBet.setCommunityAddress(4, "0x66126B5B06E740743793dde0E91575D3E6939513"), "blueBet.setCommunityAddress") //The Leos
  await sendTxn(blueBet.setCommunityAddress(5, "0x8A31669b1D3527246998E98A5dB912246356f46B"), "blueBet.setCommunityAddress") //Women from Cosmos
  await sendTxn(blueBet.setCommunityAddress(6, "0xbf769A3dcd497351A324438395fD01478f8f8A14"), "blueBet.setCommunityAddress") //Thumbs
  await sendTxn(blueBet.setCommunityAddress(7, "0x6Bd7D7D302357217b52B629ce54d854cD288532A"), "blueBet.setCommunityAddress") //Degen Brain Finance

  // await sendTxn(blueBet.setCommunityRating(0, 0), "blueBet.setCommunityRating")
  // await sendTxn(blueBet.setCommunityRating(1, 0), "blueBet.setCommunityRating")
  // await sendTxn(blueBet.setCommunityRating(2, 0), "blueBet.setCommunityRating")
  // await sendTxn(blueBet.setCommunityRating(3, 1), "blueBet.setCommunityRating")
  // await sendTxn(blueBet.setCommunityRating(4, 1), "blueBet.setCommunityRating")
  await sendTxn(blueBet.setCommunityRating(5, 1), "blueBet.setCommunityRating")
  await sendTxn(blueBet.setCommunityRating(6, 1), "blueBet.setCommunityRating")
  await sendTxn(blueBet.setCommunityRating(7, 1), "blueBet.setCommunityRating")

  // await sendTxn(blueBet.setTimeTypeCount(5), "blueBet.setTimeTypeCount")
  // await sendTxn(blueBet.prepareBetting(0, 3600, 1200), "blueBet.prepareBetting for 1h")
  // await sendTxn(blueBet.prepareBetting(1, 21600, 7200), "blueBet.prepareBetting for 6h")
  // await sendTxn(blueBet.prepareBetting(2, 43200, 14400), "blueBet.prepareBetting for 12h")
  // await sendTxn(blueBet.prepareBetting(3, 86400, 28800), "blueBet.prepareBetting for 24h")
  // await sendTxn(blueBet.prepareBetting(4, 604800, 201600), "blueBet.prepareBetting for 1w")

  // await sendTxn(blueBet.setTokenTypeCount(3), "blueBet.setTokenTypeCount")
  // await sendTxn(blueBet.setTokenConfig(0, "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", "0xc907E116054Ad103354f2D350FD2514433D57F6f"), "blueBet.setTokenConfig BTC") //BTC
  // await sendTxn(blueBet.setTokenConfig(1, "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", "0xF9680D99D6C9589e2a93a78A04A279e509205945"), "blueBet.setTokenConfig ETH") //ETH
  // await sendTxn(blueBet.setTokenConfig(2, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", "0x10C8264C0935b3B9870013e057f330Ff3e9C56dC"), "blueBet.setTokenConfig MATIC") //MATIC

  // await sendTxn(blueBet.setAmountTypeCount(3), "blueBet.setAmountTypeCount");
  // await sendTxn(blueBet.setBettingAmount(0, 0, 0, "1000000"), "blueBet.setBettingAmount for 1h BTC small amount")
  // await sendTxn(blueBet.setBettingAmount(0, 0, 1, "5000000"), "blueBet.setBettingAmount for 1h BTC middle amount")
  // await sendTxn(blueBet.setBettingAmount(0, 0, 2, "10000000"), "blueBet.setBettingAmount for 1h BTC large amount")
  // await sendTxn(blueBet.setBettingAmount(0, 1, 0, "1000000"), "blueBet.setBettingAmount for 1h ETH small amount")
  // await sendTxn(blueBet.setBettingAmount(0, 1, 1, "5000000"), "blueBet.setBettingAmount for 1h ETH middle amount")
  // await sendTxn(blueBet.setBettingAmount(0, 1, 2, "10000000"), "blueBet.setBettingAmount for 1h ETH large amount")
  // await sendTxn(blueBet.setBettingAmount(0, 2, 0, "1000000"), "blueBet.setBettingAmount for 1h MATIC small amount")
  // await sendTxn(blueBet.setBettingAmount(0, 2, 1, "5000000"), "blueBet.setBettingAmount for 1h MATIC middle amount")
  // await sendTxn(blueBet.setBettingAmount(0, 2, 2, "10000000"), "blueBet.setBettingAmount for 1h MATIC large amount")

  // await sendTxn(blueBet.setBettingAmount(1, 0, 0, "5000000"), "blueBet.setBettingAmount for 6h BTC small amount")
  // await sendTxn(blueBet.setBettingAmount(1, 0, 1, "10000000"), "blueBet.setBettingAmount for 6h BTC middle amount")
  // await sendTxn(blueBet.setBettingAmount(1, 0, 2, "20000000"), "blueBet.setBettingAmount for 6h BTC large amount")
  // await sendTxn(blueBet.setBettingAmount(1, 1, 0, "5000000"), "blueBet.setBettingAmount for 6h ETH small amount")
  // await sendTxn(blueBet.setBettingAmount(1, 1, 1, "10000000"), "blueBet.setBettingAmount for 6h ETH middle amount")
  // await sendTxn(blueBet.setBettingAmount(1, 1, 2, "20000000"), "blueBet.setBettingAmount for 6h ETH large amount")
  // await sendTxn(blueBet.setBettingAmount(1, 2, 0, "5000000"), "blueBet.setBettingAmount for 6h MATIC small amount")
  // await sendTxn(blueBet.setBettingAmount(1, 2, 1, "10000000"), "blueBet.setBettingAmount for 6h MATIC middle amount")
  // await sendTxn(blueBet.setBettingAmount(1, 2, 2, "20000000"), "blueBet.setBettingAmount for 6h MATIC large amount")

  // await sendTxn(blueBet.setBettingAmount(2, 0, 0, "20000000"), "blueBet.setBettingAmount for 12h BTC small amount")
  // await sendTxn(blueBet.setBettingAmount(2, 0, 1, "50000000"), "blueBet.setBettingAmount for 12h BTC middle amount")
  // await sendTxn(blueBet.setBettingAmount(2, 0, 2, "100000000"), "blueBet.setBettingAmount for 12h BTC large amount")
  // await sendTxn(blueBet.setBettingAmount(2, 1, 0, "20000000"), "blueBet.setBettingAmount for 12h ETH small amount")
  // await sendTxn(blueBet.setBettingAmount(2, 1, 1, "50000000"), "blueBet.setBettingAmount for 12h ETH middle amount")
  // await sendTxn(blueBet.setBettingAmount(2, 1, 2, "100000000"), "blueBet.setBettingAmount for 12h ETH large amount")
  // await sendTxn(blueBet.setBettingAmount(2, 2, 0, "20000000"), "blueBet.setBettingAmount for 12h MATIC small amount")
  // await sendTxn(blueBet.setBettingAmount(2, 2, 1, "50000000"), "blueBet.setBettingAmount for 12h MATIC middle amount")
  // await sendTxn(blueBet.setBettingAmount(2, 2, 2, "100000000"), "blueBet.setBettingAmount for 12h MATIC large amount")

  // await sendTxn(blueBet.setBettingAmount(3, 0, 0, "20000000"), "blueBet.setBettingAmount for 24h BTC small amount")
  // await sendTxn(blueBet.setBettingAmount(3, 0, 1, "50000000"), "blueBet.setBettingAmount for 24h BTC middle amount")
  // await sendTxn(blueBet.setBettingAmount(3, 0, 2, "100000000"), "blueBet.setBettingAmount for 24h BTC large amount")
  // await sendTxn(blueBet.setBettingAmount(3, 1, 0, "20000000"), "blueBet.setBettingAmount for 24h ETH small amount")
  // await sendTxn(blueBet.setBettingAmount(3, 1, 1, "50000000"), "blueBet.setBettingAmount for 24h ETH middle amount")
  // await sendTxn(blueBet.setBettingAmount(3, 1, 2, "100000000"), "blueBet.setBettingAmount for 24h ETH large amount")
  // await sendTxn(blueBet.setBettingAmount(3, 2, 0, "20000000"), "blueBet.setBettingAmount for 24h MATIC small amount")
  // await sendTxn(blueBet.setBettingAmount(3, 2, 1, "50000000"), "blueBet.setBettingAmount for 24h MATIC middle amount")
  // await sendTxn(blueBet.setBettingAmount(3, 2, 2, "100000000"), "blueBet.setBettingAmount for 24h MATIC large amount")

  // await sendTxn(blueBet.setBettingAmount(4, 0, 0, "50000000"), "blueBet.setBettingAmount for 1w BTC small amount")
  // await sendTxn(blueBet.setBettingAmount(4, 0, 1, "100000000"), "blueBet.setBettingAmount for 1w BTC middle amount")
  // await sendTxn(blueBet.setBettingAmount(4, 0, 2, "200000000"), "blueBet.setBettingAmount for 1w BTC large amount")
  // await sendTxn(blueBet.setBettingAmount(4, 1, 0, "50000000"), "blueBet.setBettingAmount for 1w ETH small amount")
  // await sendTxn(blueBet.setBettingAmount(4, 1, 1, "100000000"), "blueBet.setBettingAmount for 1w ETH middle amount")
  // await sendTxn(blueBet.setBettingAmount(4, 1, 2, "200000000"), "blueBet.setBettingAmount for 1w ETH large amount")
  // await sendTxn(blueBet.setBettingAmount(4, 2, 0, "50000000"), "blueBet.setBettingAmount for 1w MATIC small amount")
  // await sendTxn(blueBet.setBettingAmount(4, 2, 1, "100000000"), "blueBet.setBettingAmount for 1w MATIC middle amount")
  // await sendTxn(blueBet.setBettingAmount(4, 2, 2, "200000000"), "blueBet.setBettingAmount for 1w MATIC large amount")
}

async function test() {

  // const blueBet = await deployContract("BlueBet", []);
  const blueBet = await contractAt("BlueBet", "0x03272d7970e3D9bb023996530f465a152Beb39c7")
  
  // await sendTxn(blueBet.setBettingKeeper("0x8bF4A2cf561D505010793b988BdBE757e5dD994e", true), "blueBet.setBettingKeeper")

  // await sendTxn(blueBet.setDepositToken("0x21C30a738638330cf8573756355eE3e9d6001f31"), "blueBet.setDepositToken USDC")

  // await sendTxn(blueBet.setTeamAddress("0xb8E2408cCCcE6F8396245e5C84F52BCC8985cE9D"), "blueBet.setTeamAddress")

  // await sendTxn(blueBet.setCommunityCount(5), "blueBet.setCommunityCount")
  
  // await sendTxn(blueBet.setCommunityAddress(0, "0xb8E2408cCCcE6F8396245e5C84F52BCC8985cE9D"), "blueBet.setCommunityAddress") //Bluespade
  // await sendTxn(blueBet.setCommunityAddress(1, "0xb8E2408cCCcE6F8396245e5C84F52BCC8985cE9D"), "blueBet.setCommunityAddress") //Raijins
  // await sendTxn(blueBet.setCommunityAddress(2, "0xb8E2408cCCcE6F8396245e5C84F52BCC8985cE9D"), "blueBet.setCommunityAddress") //Bluebet
  // await sendTxn(blueBet.setCommunityAddress(3, "0x687AaCDe22D3425fE5D0054b289873815E531fa8"), "blueBet.setCommunityAddress") //Factions NFT
  // await sendTxn(blueBet.setCommunityAddress(4, "0x66126B5B06E740743793dde0E91575D3E6939513"), "blueBet.setCommunityAddress") //The Leos
  // await sendTxn(blueBet.setCommunityRating(0, 0), "blueBet.setCommunityRating")
  // await sendTxn(blueBet.setCommunityRating(1, 0), "blueBet.setCommunityRating")
  // await sendTxn(blueBet.setCommunityRating(2, 0), "blueBet.setCommunityRating")
  // await sendTxn(blueBet.setCommunityRating(3, 1), "blueBet.setCommunityRating")
  // await sendTxn(blueBet.setCommunityRating(4, 1), "blueBet.setCommunityRating")

  // await sendTxn(blueBet.setTimeTypeCount(5), "blueBet.setTimeTypeCount")
  // await sendTxn(blueBet.prepareBetting(0, 3600, 1200), "blueBet.prepareBetting for 1h")
  // await sendTxn(blueBet.prepareBetting(1, 21600, 7200), "blueBet.prepareBetting for 6h")
  // await sendTxn(blueBet.prepareBetting(2, 43200, 14400), "blueBet.prepareBetting for 12h")
  // await sendTxn(blueBet.prepareBetting(3, 86400, 28800), "blueBet.prepareBetting for 24h")
  // await sendTxn(blueBet.prepareBetting(4, 604800, 201600), "blueBet.prepareBetting for 1w")

  // await sendTxn(blueBet.setTokenTypeCount(3), "blueBet.setTokenTypeCount")
  // await sendTxn(blueBet.setTokenConfig(0, "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", "0x31CF013A08c6Ac228C94551d535d5BAfE19c602a"), "blueBet.setTokenConfig BTC") //BTC
  // await sendTxn(blueBet.setTokenConfig(1, "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", "0x86d67c3D38D2bCeE722E601025C25a575021c6EA"), "blueBet.setTokenConfig ETH") //ETH
  // await sendTxn(blueBet.setTokenConfig(2, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", "0xB0924e98CAFC880ed81F6A4cA63FD61006D1f8A0"), "blueBet.setTokenConfig MATIC") //MATIC

  // await sendTxn(blueBet.setAmountTypeCount(3), "blueBet.setAmountTypeCount");
  // await sendTxn(blueBet.setBettingAmount(0, 0, 0, "1000000000000000000"), "blueBet.setBettingAmount for 1h BTC small amount")
  // await sendTxn(blueBet.setBettingAmount(0, 0, 1, "5000000000000000000"), "blueBet.setBettingAmount for 1h BTC middle amount")
  // await sendTxn(blueBet.setBettingAmount(0, 0, 2, "10000000000000000000"), "blueBet.setBettingAmount for 1h BTC large amount")
  // await sendTxn(blueBet.setBettingAmount(0, 1, 0, "1000000000000000000"), "blueBet.setBettingAmount for 1h ETH small amount")
  // await sendTxn(blueBet.setBettingAmount(0, 1, 1, "5000000000000000000"), "blueBet.setBettingAmount for 1h ETH middle amount")
  // await sendTxn(blueBet.setBettingAmount(0, 1, 2, "10000000000000000000"), "blueBet.setBettingAmount for 1h ETH large amount")
  // await sendTxn(blueBet.setBettingAmount(0, 2, 0, "1000000000000000000"), "blueBet.setBettingAmount for 1h MATIC small amount")
  // await sendTxn(blueBet.setBettingAmount(0, 2, 1, "5000000000000000000"), "blueBet.setBettingAmount for 1h MATIC middle amount")
  await sendTxn(blueBet.setBettingAmount(0, 2, 2, "10000000000000000000"), "blueBet.setBettingAmount for 1h MATIC large amount")

  await sendTxn(blueBet.setBettingAmount(1, 0, 0, "5000000000000000000"), "blueBet.setBettingAmount for 6h BTC small amount")
  await sendTxn(blueBet.setBettingAmount(1, 0, 1, "10000000000000000000"), "blueBet.setBettingAmount for 6h BTC middle amount")
  await sendTxn(blueBet.setBettingAmount(1, 0, 2, "20000000000000000000"), "blueBet.setBettingAmount for 6h BTC large amount")
  await sendTxn(blueBet.setBettingAmount(1, 1, 0, "5000000000000000000"), "blueBet.setBettingAmount for 6h ETH small amount")
  await sendTxn(blueBet.setBettingAmount(1, 1, 1, "10000000000000000000"), "blueBet.setBettingAmount for 6h ETH middle amount")
  await sendTxn(blueBet.setBettingAmount(1, 1, 2, "20000000000000000000"), "blueBet.setBettingAmount for 6h ETH large amount")
  await sendTxn(blueBet.setBettingAmount(1, 2, 0, "5000000000000000000"), "blueBet.setBettingAmount for 6h MATIC small amount")
  await sendTxn(blueBet.setBettingAmount(1, 2, 1, "10000000000000000000"), "blueBet.setBettingAmount for 6h MATIC middle amount")
  await sendTxn(blueBet.setBettingAmount(1, 2, 2, "20000000000000000000"), "blueBet.setBettingAmount for 6h MATIC large amount")

  await sendTxn(blueBet.setBettingAmount(2, 0, 0, "20000000000000000000"), "blueBet.setBettingAmount for 12h BTC small amount")
  await sendTxn(blueBet.setBettingAmount(2, 0, 1, "50000000000000000000"), "blueBet.setBettingAmount for 12h BTC middle amount")
  await sendTxn(blueBet.setBettingAmount(2, 0, 2, "100000000000000000000"), "blueBet.setBettingAmount for 12h BTC large amount")
  await sendTxn(blueBet.setBettingAmount(2, 1, 0, "20000000000000000000"), "blueBet.setBettingAmount for 12h ETH small amount")
  await sendTxn(blueBet.setBettingAmount(2, 1, 1, "50000000000000000000"), "blueBet.setBettingAmount for 12h ETH middle amount")
  await sendTxn(blueBet.setBettingAmount(2, 1, 2, "100000000000000000000"), "blueBet.setBettingAmount for 12h ETH large amount")
  await sendTxn(blueBet.setBettingAmount(2, 2, 0, "20000000000000000000"), "blueBet.setBettingAmount for 12h MATIC small amount")
  await sendTxn(blueBet.setBettingAmount(2, 2, 1, "50000000000000000000"), "blueBet.setBettingAmount for 12h MATIC middle amount")
  await sendTxn(blueBet.setBettingAmount(2, 2, 2, "100000000000000000000"), "blueBet.setBettingAmount for 12h MATIC large amount")

  await sendTxn(blueBet.setBettingAmount(3, 0, 0, "20000000000000000000"), "blueBet.setBettingAmount for 24h BTC small amount")
  await sendTxn(blueBet.setBettingAmount(3, 0, 1, "50000000000000000000"), "blueBet.setBettingAmount for 24h BTC middle amount")
  await sendTxn(blueBet.setBettingAmount(3, 0, 2, "100000000000000000000"), "blueBet.setBettingAmount for 24h BTC large amount")
  await sendTxn(blueBet.setBettingAmount(3, 1, 0, "20000000000000000000"), "blueBet.setBettingAmount for 24h ETH small amount")
  await sendTxn(blueBet.setBettingAmount(3, 1, 1, "50000000000000000000"), "blueBet.setBettingAmount for 24h ETH middle amount")
  await sendTxn(blueBet.setBettingAmount(3, 1, 2, "100000000000000000000"), "blueBet.setBettingAmount for 24h ETH large amount")
  await sendTxn(blueBet.setBettingAmount(3, 2, 0, "20000000000000000000"), "blueBet.setBettingAmount for 24h MATIC small amount")
  await sendTxn(blueBet.setBettingAmount(3, 2, 1, "50000000000000000000"), "blueBet.setBettingAmount for 24h MATIC middle amount")
  await sendTxn(blueBet.setBettingAmount(3, 2, 2, "100000000000000000000"), "blueBet.setBettingAmount for 24h MATIC large amount")

  await sendTxn(blueBet.setBettingAmount(4, 0, 0, "50000000000000000000"), "blueBet.setBettingAmount for 1w BTC small amount")
  await sendTxn(blueBet.setBettingAmount(4, 0, 1, "100000000000000000000"), "blueBet.setBettingAmount for 1w BTC middle amount")
  await sendTxn(blueBet.setBettingAmount(4, 0, 2, "200000000000000000000"), "blueBet.setBettingAmount for 1w BTC large amount")
  await sendTxn(blueBet.setBettingAmount(4, 1, 0, "50000000000000000000"), "blueBet.setBettingAmount for 1w ETH small amount")
  await sendTxn(blueBet.setBettingAmount(4, 1, 1, "100000000000000000000"), "blueBet.setBettingAmount for 1w ETH middle amount")
  await sendTxn(blueBet.setBettingAmount(4, 1, 2, "200000000000000000000"), "blueBet.setBettingAmount for 1w ETH large amount")
  await sendTxn(blueBet.setBettingAmount(4, 2, 0, "50000000000000000000"), "blueBet.setBettingAmount for 1w MATIC small amount")
  await sendTxn(blueBet.setBettingAmount(4, 2, 1, "100000000000000000000"), "blueBet.setBettingAmount for 1w MATIC middle amount")
  await sendTxn(blueBet.setBettingAmount(4, 2, 2, "200000000000000000000"), "blueBet.setBettingAmount for 1w MATIC large amount")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
