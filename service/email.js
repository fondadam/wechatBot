const nodemailer  = require('nodemailer')

const log = require('../libs/log.js')

const ADDRESS_FROM = 'fondadam@qq.com'
const ADDRESS_TO = 'fondadam@hotmail.com'

const PASS = 'aqlcleeizcoibjgj'

const mailOptions = {
    from: `"wechat robot" <${ADDRESS_FROM}>`, // 发件人
    to: `${ADDRESS_TO}`, // 收件人
    subject: `主题`,
    html: `<b>这是内容</b>`
    // 下面是发送附件，不需要就注释掉
    // attachments: [{
    //         filename: 'test.md',
    //         path: './test.md'
    //     },
    //     {
    //         filename: 'content',
    //         content: '发送内容'
    //     }
    // ]
}

// 开启一个 SMTP 连接池
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secureConnection: true, // use SSL
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: ADDRESS_FROM,
        pass: PASS // QQ邮箱需要使用授权码
    }
})

const sendMail = (config) => (
    new Promise((resolve, reject) => {
		config = Object.assign({}, mailOptions, config)
	
		transporter.sendMail(config, (error, info) => {
			if (error) {
				log.error(`发送邮件失败: ${error}`)
                reject(error)
			} else {
				log.info(`发送邮件成功 ！`)
                resolve(info)
            }
			
		})
    })
)

module.exports = {
    sendMail
}
