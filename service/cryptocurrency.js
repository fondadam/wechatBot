const superagent = require('superagent')
const cheerio = require('cheerio')

const util = require('util')

const {get} = require('../libs/common')

// 获取数字货币的全称
const  fullNameURL = 'https://api.feixiaohao.com/search/relatedword?q=%s'
const  priceCoinURL = 'https://www.feixiaohao.com/currencies/%s'

// 获取简写
const getCoinFullName = async (name = 'bts') => {
    const url = util.format(fullNameURL, name)
    const fullNameList = await get(url, {json: true, qs: {q: name}})
    const fullName = fullNameList[0]
    let ret = ''
    if(fullName) {
        ret = fullName.split('#')[1]
        if(ret.length > 10) {
            ret = ''
        }
    }
    return ret;
}

// 从非小号那里抓取价格消息: https://www.feixiaohao.com/currencies/coinFullName
const getPriceFromPage = async (name = 'eos') => {
    const fullName = await getCoinFullName(name)
    return new Promise((resolve, reject) => {
        const url = util.format(priceCoinURL, fullName || name)
        try {
            superagent.get(url).end((err, res) => {
                if (err) {
                    return
                }
                const $ = cheerio.load(res.text)
                
                // 1. 货币名字
                const contentDOM_1 = $('.secondPark')[0]
                const coinName = $(contentDOM_1).find('ul li:first-child span.value').text()
                // 2. 价格
                const contentDOM_2 = $('.firstPart')[0]
                // ---> 价格涨跌幅
                const change = $(contentDOM_2).find('.maket .coinprice span').text()
                // ---> 均价
                const averagePrice =  $(contentDOM_2).find('.maket .coinprice').text()
                    .replace(new RegExp(change, 'ig'), '')
                // ---> 美元价格
                const usdtPrice = $(contentDOM_2).find('.maket .sub span:first-child').text().replace(/≈/ig, '')
                // 3. 24H 最高最低价
                // ---> 24H最高价格
                const highPrice = $(contentDOM_2).find('.maket .lowHeight div:first-child .value').text()
                // ---> 24H最低价格
                const lowPrice = $(contentDOM_2).find('.maket .lowHeight div:last-child .value').text()
                // 4. 流通市值
                const circulateDOM = $(contentDOM_2).find('.cell:nth-child(2)')
                // ---> 市值排名
                const circulateNumberValue = $(circulateDOM).find('.value .tag-marketcap').text()
                // ---> 全球总市值 美元
                const circulateTotalValue = $(circulateDOM).find('.sub').first().text().replace(/≈/ig, '')
                // 占全球总市值的百分比
                const circulateTotalPercent = $(circulateDOM).find('.ct-chart .chardec span:first-child').text().trim()
                
                resolve({
                    coinName,
                    averagePrice,
                    usdtPrice,
                    highPrice,
                    lowPrice,
                    circulateNumberValue,
                    circulateTotalValue,
                    circulateTotalPercent
                })
            })
        } catch(error) {
            reject(error)
        }
    })
}

module.exports = {
    getPriceFromPage,
    getCoinFullName
}