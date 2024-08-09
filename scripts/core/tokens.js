// price feeds https://docs.chain.link/docs/binance-smart-chain-addresses/
// const { expandDecimals } = require("../../test/shared/utilities")

module.exports = {
  skale: {
    wbtc: {
      name: "wbtc",
      address: "0xaEdA10d1479A187dCEe8e62773C8620C73dFb111",
      decimals: 8,
      priceFeed: "0xF7151bfBBe9eAbC5680C248a69Ea7474067E6892",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.20 * 10 * 1000 * 1000, // 20%
      isStrictStable: false,
      tokenWeight: 0,
      minProfitBps: 0,
      maxUsdgAmount: 0,
      bufferAmount: 200,
      spreadBasisPoints: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 10 * 1000 * 1000,
      maxGlobalShortSize: 15 * 1000 * 1000
    },
    usdt: {
      name: "usdt",
      address: "0x9Bbb18a5823Be313B9f99EE72d4B4413c7FA019F",
      decimals: 6,
      priceFeed: "0xCb98ffaB40060475BAFB5f04324294C2c0A6206D",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 10000,
      minProfitBps: 0,
      maxUsdgAmount: 5000 * 1000 * 1000,
      bufferAmount: 17 * 1000 * 1000,
      spreadBasisPoints: 0,
      isStable: true,
      isShortable: false
    },
    collateralToken: {
      name: "usdt",
      address: "0x9Bbb18a5823Be313B9f99EE72d4B4413c7FA019F",
      decimals: 6
    }
  }
}
