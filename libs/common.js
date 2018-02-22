const _ = require('lodash')
const request = require('request-promise')
const schedule = require('node-schedule')

const get = (uri, options = {}) => {
    options = Object.assign({}, options, {method: "GET", uri})
    
    return request(options)
}

const post = (uri, options) => {
    options = Object.assign({}, options, {method: "POST", uri})
    
    return request(options)
}

const formatTime = (m) => (`${m}`.length === 1 ? `0${m}` : `${m}`)

const compactObject = (obj) => (_.pickBy(obj, (v) => (v !== undefined && v !== null)))

const leftPadZero = (m) => (`${m}`.length === 1 ? `0${m}` : `${m}`)

const getTodayDateTime = () => {
    const date = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    
    return `${leftPadZero(month)}-${leftPadZero(day)} ${leftPadZero(hour)}:${leftPadZero(minute)}:${leftPadZero(second)}`
}

const scheduleService = (config, callback) => {
    const rule = new schedule.RecurrenceRule()
    const configKeyList = Object.keys(config)
    
    for (let i in configKeyList) {
        const key = configKeyList[i]
        const val = config[key]
        rule[key] = val
    }
    
    return schedule.scheduleJob(rule, async () => {
        await callback()
    })
}

module.exports = {
    get,
    post,
    formatTime,
    compactObject,
    getTodayDateTime,
    scheduleService
}
