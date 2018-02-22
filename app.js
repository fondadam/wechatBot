const {Wechaty, Contact, Room, MsgType, config} = require('wechaty')

const QrcodeTerminal = require('qrcode-terminal')

const {sendMail} = require('./service/email.js')
const log = require('./libs/log.js')

const {getTodayDateTime} = require('./libs/common')

// ---
const {getCoinFullName, getPriceFromPage} = require('./service/cryptocurrency')
const {postForTulingReply} = require('./service/tuling')
const {scheduleForMarketBySecond} = require('./service/zb')
// 邮件通知
let startNumber = 0
const EMAIL_SEND_LIMIT = 5

// wechatBot start...
const bot = Wechaty.instance({profile: config.default.DEFAULT_PROFILE})

bot
    .on('scan', async (url, code) => {
        if (!/201|200/.test(String(code))) {
            const loginUrl = url.replace(/\/qrcode\//, '/l/')
            QrcodeTerminal.generate(loginUrl, {small: true})
            startNumber++
            if (startNumber < EMAIL_SEND_LIMIT) {
                // 邮件通知扫码
                sendMail({
                    subject: `请扫码登录微信`,
                    html: `
						服务器当前时间： ${getTodayDateTime()}
						<br/>
						二维码地址：<a href="${url}">${url}</a>
						<br/>
						<p>二维码图片(可能会加载失败，请点链接):</p>
						<div style="display:inline-block;border:1px solid #CCC; min-width: 200px;min-height:200px">
							<img src="cid:888"/>
						</div>
					`,
                    attachments: [{
                        filename: `qrcode.png`,
                        path: `${url}`,
                        cid: '888'
                    }]
                })
            }
            log.info(`System:`, `[${code}] 请扫描二维码登录 ... `)
            log.info(`System:`, `[${code}] 正在发送邮件通知扫码登录 ... `)
        } else {
            log.info(`System:`, `[${code}] 扫码成功，请在手机上确认 ! `)
        }
    })

    .on('login', async user => {
        log.info(`System:`, `账号 ${user} 已登录`)
        let noAlert = false
        scheduleForMarketBySecond('zbqc', (shouldBeAlert, data) => {
            Room.findAll({ topic: /^robot/i }).then(async roomList => {
                roomList.forEach(async room => {
                    const asks = data.askThresholdList
                    const bids = data.bidThresholdList

                    let askContent = ''
                    let bidContent = ''

                    if(shouldBeAlert) {
                        noAlert = false
                        if(asks.length > 0) {
                            await room.say(`${asks[0].title}\n深度档位: ${asks[0].level}\n存在${asks.length}个卖单超过了${asks[0].limit}元`)
                            for(let i = 0; i < asks.length; i++) {
                                askContent += `卖${asks[i].index}单价: ${asks[i].price}\n卖${asks[i].index}数量: ${asks[i].amount}\n\n`
                            }
                            await room.say(askContent)
                        }
                        if(bids.length > 0) {
                            await room.say(`${bids[0].title}\n深度档位: ${bids[0].level}\n存在${bids.length}个买单超过了${bids[0].limit}元`)
                            for(let i = 0; i < bids.length; i++) {
                                bidContent += `卖${bids[i].index}单价: ${bids[i].price}\n卖${bids[i].index}数量: ${bids[i].amount}\n\n`
                            }
                            await room.say(bidContent)
                        }
                    } else {
                        if(!noAlert) {
                            await room.say(`当前没有超过阈值的买卖单提醒，继续监测中...`)
                        }
                        noAlert = true
                    }
                })
            })
        })
    })

    .on('message', async m => {
        if (m.self()) {
            return
        }
    	try {
    		const room = m.room()

    		if (room) {
                if (m.type() === MsgType.TEXT) {
                    const myName = bot.self().name()
                    const replaceText = `@${myName}`
                    const mContent = m.content()
                    const rRegexp = new RegExp(replaceText)
                    const isMentioned = rRegexp.test(mContent)
                    const rContent = mContent.replace(rRegexp, '').trim()

                    const fullName = await getCoinFullName(rContent)
                    if(fullName) {
                        const infoObj = await getPriceFromPage(fullName)
                        const content_1 = `${infoObj.coinName}\n`
                        const content_2 = `全球均价(CNY) : ${infoObj.averagePrice}\n`
                        const content_3 = `全球均价(USD) : ${infoObj.usdtPrice}\n`
                        const content_4 = `24小时最高价  : ${infoObj.highPrice}\n`
                        const content_5 = `24小时最低价  : ${infoObj.lowPrice}\n`
                        const content_6 = `总市值排名 : ${infoObj.circulateNumberValue}(${infoObj.circulateTotalPercent})\n`
                        const content_7 = `全球总市值 : ${infoObj.circulateTotalValue}\n`

                        const from = `\n数据来源: https://www.feixiaohao.com/currencies/${fullName}`

                        room.say(`${content_1}${content_2}${content_3}${content_4}${content_5}${content_6}${content_7}${from}`)
                    } else {
                        const fromId = m.from().id
                        const fromName = m.from().name()

                        if(isMentioned) {
                            const postData = {info: rContent, userid: fromId}
                            const tuling = await postForTulingReply(postData)
                            room.say(`@${fromName}\n${tuling.text}`)
                        }
                    }
                }
    		} else {
    		    // todo
    			// 如果alias是robot开头的，则提供服务
    			// 个人可以订阅信息(爬虫)、查询股票、数字货币、实时新闻
    		}
    	} catch (e) {
    		log.error('Bot', 'on(message) exception: %s', e)
    	}
    })

    .start()
    .catch(e => {
        sendMail({
            subject: `微信机器人服务出错了`,
            html: `
                    <strong>微信机器人服务出错了！！！</strong>
                    <br/>
                    <div>错误信息：</div>
                    <p>${JSON.stringify(e)}</p>`
        })
        log.error(`System`, `机器人出错了: ${e}`)
        bot.quit()
        process.exit(-1)
    })