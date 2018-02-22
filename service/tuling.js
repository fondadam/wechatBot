const {post} = require('../libs/common')

const URL = 'http://api.fondadam.cn/tuling'

const postForTulingReply = async (postData) => {
    const result = await post(URL, {json: true, body: postData})
    return result && result.data;
}

module.exports = {
    postForTulingReply
}