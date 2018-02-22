const util = require('util')

// 火币行情: 适用所有Pro站交易中的交易对
const market = 'https://api.huobi.pro/market'

/**
 * 获取K线数据
 * @param symbol string.required  交易对如：btcusdt
 * @param period string.required  K线类型如：1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year
 * @param size number  获取数量,[1,2000],默认为 1
 *
 * id: K线id
 * amount: 成交量
 * count: 成交笔数
 * open: 开盘价
 * close: 收盘价,当K线为最晚的一根时，是最新成交价
 * low: 最低价
 * high: 最高价
 * vol: 成交额, 即 sum(每一笔成交价 * 该笔的成交量)
 */
const getKLine = (symbol, period, size = 1) => (
    `${market}/history/kline?symbol=${symbol}&period=${period}&size=${size}`
)

/**
 * 获取聚合行情(Ticker)
 * @param symbol.required string  交易对如：btcusdt
 *
 * id: K线id
 * amount: 成交量
 * count: 成交笔数
 * open: 开盘价
 * close: 收盘价,当K线为最晚的一根时，是最新成交价
 * low: 最低价
 * high: 最高价
 * vol: 成交额, 即 sum(每一笔成交价 * 该笔的成交量)
 * bid: [买1价,买1量]
 * ask: [卖1价,卖1量]
 *
 */
const getTicker = (symbol) => (`${market}/detail/merged?symbol=${symbol}`)

/**
 * 获取 Market Depth 数据
 * @param symbol.required string  交易对如：btcusdt
 * @param type.required string  Depth 类型如：step0, step1, step2, step3, step4, step5（合并深度0-5）；step0时，不合并深度
 *
 *   "tick": {
     *      "id": 消息id,
     *      "ts": 消息生成时间，单位：毫秒,
     *      "bids": 买盘,[price(成交价), amount(成交量)], 按price降序,
     *      "asks": 卖盘,[price(成交价), amount(成交量)], 按price升序
     *  }
 */
const getMarketDepth = (symbol, type) => (`${market}/depth?symbol=${symbol}&type=${type}`)

/**
 * 获取 Trade Detail 数据
 * @param symbol.required string  交易对如：btcusdt
 *
 * "data": [{
     *      "id": 成交id,
     *      "price": 成交价钱,
     *      "amount": 成交量,
     *      "direction": 主动成交方向,
     *      "ts": 成交时间
     * }]
 *
 */
const getTradeDetail = (symbol) => (`${market}/trade?symbol=${symbol}`)

/**
 * 批量获取最近的交易记录
 * @param symbol.required string  交易对如：btcusdt
 * @param size   number     获取交易记录的数量[1, 2000] 默认： 1
 *
 * "data": [{
     *      "id": 成交id,
     *      "price": 成交价,
     *      "amount": 成交量,
     *      "direction": 主动成交方向,
     *      "ts": 成交时间
     * }]
 */
const getHistoryTradeDetail = (symbol, size = 1) => (`${market}/history/trade?symbol=${symbol}&size=${size}`)

/**
 * 获取 Market Detail 24小时成交量数据
 * @param symbol.required string  交易对如：btcusdt
 *
 * "tick": {
     *      "id": 成交id,
     *      "ts": 24小时统计时间,
     *      "amount": 24小时成交量,
     *      "open": 前推24小时成交价,
     *      "close": 当前成交价,
     *      "high": 近24小时最高价,
     *      "low": 近24小时最低价,
     *      "count": 近24小时累积成交数,
     *      "vol": 近24小时累积成交额, 即 sum(每一笔成交价 * 该笔的成交量)
     * }
 */
const getMarketDetail = (symbol) => (`${market}/detail?symbol=${symbol}`)

module.exports = {
    getKLine,
    
    getTicker,
    
    getMarketDepth,
    
    getTradeDetail,
    
    getHistoryTradeDetail,
    
    getMarketDetail
}

