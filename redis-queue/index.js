const redis = require('redis');
const uuidv4 = require('uuid/v4');
var bluebird = require("bluebird");

const _config = require('./config')

class RedisQueue {
	constructor(config={}) {    
        this.config = Object.assign({}, _config, config||{});

        // this.methods = {
        //     'redis.hello' : {
        //         handler : (body) => {
        //             console.log('handler', body)
        //             return {
        //                 fullName: body.fullname
        //             }
        //         }
        //     }
        // }

        this.methods = [
            
        ]
    }
    
    
    async init() {
        await App.Hook.Action.do('RedisQueue/Init')

        console.log('Redis-queue Init.')

        this.client = redis.createClient({
            db: this.config.db
        });

        this.sender = redis.createClient({
            db: this.config.db
        });

        // this.sender2 = redis.createClient({
        //     db: this.config.db
        // });

        this.brpopAsync = bluebird.Promise.promisify(this.client.brpop).bind(this.client);

        // this.sendMessage('kapp', {})
        

        this.waitForPush()

        // setTimeout(() => {
        //     this.sendMessage('kapp', {})
        // }, 5000)

        // subscriber.on("message", function (channel, message) {
        //     const m = JSON.parse(message)
        //     console.log(m.key)
        //     subscriber.lpush(m.key, 'value')
        //     console.log("Message: " + message + " on channel: " + channel + " is arrive!");
        // });
        // subscriber.subscribe("notification");

        

    }

    registerMethods(methods=[]) {
        for (const method of methods) {
            console.log(method)
        }
    }

    async sendMessage(key, message={}) {
        const uid = uuidv4()
        message.uid = uid
    
        console.log('SEND', uid)
    
        this.sender.lpush(key, JSON.stringify(message))
    
        // this.sender.brpop(uid, 5, function (err, item) {
        //     console.log('SEND ACK', err, item)
        // })
        // const req = await this.brpopAsync(this.config.queueListnerKey, 60)
        // const result = this.parseMessage(req)
        // // console.log(result)
        // return result
    }

    async waitForPush () {
        
        await this.processQueue(this.config.queueListnerKey)
        // await this.processQueue('auth11')
        
        this.waitForPush()
        // this.client.brpop(this.config.queueListnerKey, 0, (err, req) => {
        //   // do stuff
        //     // console.log(listName, item)
        //     if(err) {
        //         console.log(err)
        //         throw(err)
        //     }

        //     const message = this.parseMessage(req)
        //     console.log(message)
        //     // console.log(this)
        //     this.waitForPush()
    
        //     // const reply = {
        //     //     statusCode: 200,
        //     //     uid: message.requestID
        //     // }
    
        //     // client.rpush(message.requestID, JSON.stringify(reply))
        //     // process.nextTick(this.waitForPush);

        //     // setTimeout(() => {
        //     //     client.expire(message.requestID, 20)
        //     //     console.log('Reply Sent')
        //     // }, 10000)
    
        // });
    }

    async processQueue(queueName) {
        const req = await this.brpopAsync(queueName, 0)
        // console.log('req', req)
        
        const message = this.parseMessage(req)
        // console.log(message)

        const reply = await this.callMethod(message)
        console.log('REPLY', reply)

        this.client.rpush(message.uid, JSON.stringify(reply))
    }


    createReply(message, handlerResult) {
        if(!this.isObject(handlerResult)) {
            return {
                statusCode: 200,
                uid: message.uid
            }
        }

        handlerResult.uid = message.uid
        return handlerResult
    }

    async callMethod(message) {
        if(message.method && this.methods[message.method]) {
            const result = this.methods[message.method]['handler'](message.params||{})
            return this.createReply(message, result)
        }

        return this.createReply(message, null)
    }

    parseMessage(req) {
        if(!req || !Array.isArray(req) || !req[1]) {
            return {
                method: null,
                params: {},
                uid: null
            }
        }

        const message = JSON.parse(req[1])
        return message
    }

    isObject(obj){
        return obj != null && obj.constructor.name === "Object"
    }

}
module.exports = RedisQueue