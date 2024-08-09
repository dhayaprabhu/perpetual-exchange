// const deployTokenManager = require("../access/deployTokenManager");
// const deployOrderBook = require("../core/deployOrderBook");
// const deployPositionManager = require("../core/deployPositionManager");
// const deployPositionRouter = require("../core/deployPositionRouter");
// const deployReferralReader = require("../core/deployReferralReader");
// const deployReferralStorage = require("../core/deployReferralStorage");
// const setTiersReferralStorage = require("../core/setTiersReferralStorage");
// const deployVault = require("../core/deployVault");
// const deployBLU = require("../blu/deployBLU");
// const deployTokens = require("../blu/deployTokens");
// const deployOrderBookReader = require("../peripherals/deployOrderBookReader");
// const deployPriceFeedTimelock = require("../peripherals/deployPriceFeedTimelock");
// const deployReader = require("../peripherals/deployReader");
// const deployRewardReader = require("../peripherals/deployRewardReader");
// const deployShortsTracker = require("../core/deployShortsTracker");
// const deployShortsTrackerTimelock = require("../peripherals/deployShortsTrackerTimelock");
// const deployTimelock = require("../peripherals/deployTimelock");
// const deployVaultReader = require("../peripherals/deployVaultReader");
// const deployRewardRouterV2 = require("../staking/deployRewardRouterV2");
// const deployPriceFeed = require("../core/deployPriceFeed");
const { getGasUsed, syncDeployInfo } = require("../shared/syncParams");
// const deployPriceFeedExt = require("../pricefeedext/pricefeedext");
// const deployBlpRewardRouter = require("../staking/deployBlpRewardRouter");
// const deployMulticall = require("../core/deployMulticall");
// const directPoolDeposit = require("../core/directPoolDeposit");
// const configureNewToken = require("../peripherals/configureNewToken");
// const setDistributorValues = require("../core/setDistributorValues");
// const deployBatchSender = require("../peripherals/deployBatchSender");
// const setMaxGlobalSizes = require("../core/setMaxGlobalSizes");
// const setConfigForBot = require("../core/setConfigForBot");

const deploy_skale = async () => {
  syncDeployInfo("USDT", {
    name: "USDT",
    imple: "0xB43789e0830C63556074cAC90fBE66bb73DB10d9",
  });

  syncDeployInfo("MultiSigner1", {
    name: "MultiSigner1",
    imple: "0x5d2E4189d0b273d7E7C289311978a0183B96C404",
  });
  return;
  // syncDeployInfo("MultiSigner2", {
  //   name: "MultiSigner2",
  //   imple: "0x705788df9535de13a1266Fe3418eb766734266e7",
  // });
  // syncDeployInfo("MultiSigner3", {
  //   name: "MultiSigner3",
  //   imple: "0xfEA7398057E6F95Bc528Ec04925148d17f99273b",
  // });
  // syncDeployInfo("MultiSigner4", {
  //   name: "MultiSigner4",
  //   imple: "0xb774546Aafdc55b2F2da0fC522de169c35Ea4D55",
  // });
  // syncDeployInfo("MultiSigner5", {
  //   name: "MultiSigner5",
  //   imple: "0xa9419002c3C5380c6074B762Ebc86088bA93FE7d",
  // });
  // syncDeployInfo("MultiSigner6", {
  //   name: "MultiSigner6",
  //   imple: "0xa5743F9b9775B9f19de0b75a2A7C36Bc82691A50",
  // });
  // syncDeployInfo("WETH", {
  //   name: "WETH",
  //   imple: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27",
  // });

  // await deployMulticall()
  // await deployPriceFeedExt() // check
  // await deployBLU()
  await deployVault()
  await deployVaultReader()
  await deployReader()
  await deployRewardReader()
  await deployTokens()
  await deployRewardRouterV2()
  await deployOrderBook()
  await deployOrderBookReader()
  await deployReferralStorage()
  await setTiersReferralStorage();
  await deployReferralReader()
  await deployTokenManager()
  await deployPriceFeedTimelock()
  await deployTimelock()
  await deployShortsTracker();
  await deployShortsTrackerTimelock()
  await deployPositionRouter()
  await deployPositionManager()
  await setDistributorValues()
  await deployBatchSender()
  await deployPriceFeed()

  await deployBlpRewardRouter()
  await setMaxGlobalSizes();
  
  // // await setConfigForBot(); // no need

  console.log("gas used:", getGasUsed());

  await directPoolDeposit('1000000000000000000') // 1 WETH
  await configureNewToken()
};

module.exports = { deploy_skale };
