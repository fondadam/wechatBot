const util = require('util')
const {get, scheduleService} = require('../libs/common')

const URL = 'http://api.zb.com/data/v1/depth?market=%s&size=%s'

const getCurrentMarketInfo = async (symbol, size = 3) => {
    const marketUrl = util.format(URL, symbol, size)
    const result = await get(marketUrl)
    
    return JSON.parse(result)
}

// 定时查询市场行情 每 5s 查询一次
const scheduleForMarketBySecond = (symbol, callback, size = 5, SECOND = 10) => {
    const timeList = [];
    for(let i=1; i<60; i++){
        if(i % SECOND === 0) {
            timeList.push(i)
        }
    }
    
    scheduleService({second: timeList}, async () => {
        const marketInfo = await getCurrentMarketInfo(symbol, size)
        // 卖方  askList
        const askList = marketInfo.asks.reverse()
        // 买方 bidList
        const bidList = marketInfo.bids
        
        //阈值 人民币
        const LIMIT = 10 * Math.pow(10, 4)
        
        // 卖方超过阈值提醒
        const askThresholdList = []
        // 买方超过阈值提醒
        const bidThresholdList = []
        
        // 是否需要提醒
        let shouldBeAlert = false
        
        askList.forEach((val, i) => {
            if(val[0] * val[1] >= LIMIT) {
                shouldBeAlert = true
                askThresholdList.push({
                    index: i + 1,
                    title: symbol,
                    limit: LIMIT,
                    level: size,
                    price: val[0],
                    amount: val[1],
                    tip: `当前存在[卖单(卖${i+1})）]超过\n${LIMIT}\n人民币`
                })
            }
        })
    
        bidList.forEach((val, i) => {
            if(val[0] * val[1] >= LIMIT) {
                shouldBeAlert = true
                bidThresholdList.push({
                    index: i + 1,
                    title: symbol,
                    limit: LIMIT,
                    level: size,
                    price: val[0],
                    amount: val[1],
                    tip: `当前存在[买单(买${i+1})）]超过\n${LIMIT}\n人民币`
                })
            }
        })
        
        callback(shouldBeAlert, {
            askThresholdList,
            bidThresholdList
        })
    })
}

module.exports = {
    getCurrentMarketInfo,
    scheduleForMarketBySecond
}