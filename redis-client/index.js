const redis = require('redis');
const uuidv4 = require('uuid/v4');
var bluebird = require("bluebird");
var express = require('express');
const _config = require('./config')
const {promisify} = require('util');

var Command = require('redis/lib/command');

class RedisClient {
	constructor(config={}) {    
        this.config = Object.assign({}, _config, config||{});

        this._actions();
    }
    
    
    async init() {
        console.log('Redis-client Init.')
        // console.log(this.config.db)
        let client = redis.createClient({
            // db: this.config.db
            db: 1
        });

        // this.send_command = promisify(client.send_command).bind(client);
        this.internal_send_command = promisify(client.internal_send_command).bind(client);

        // console.log(client.internal_send_command)

        this.client = client
        // this.client.set("string key", "string val", redis.print);

        // console.log(this.client.info('keyspace', redis.print))
        // this.client.internal_send_command(new Command('info', [], info_callback(this, callback)));

        // this.client.send_command('KEYS', ['*'], function(err, res) {
        //     console.log(arguments);
        // });

        // console.log(this.client.server_info)

        // this.client.set("kamina2", "testing1", redis.print);
                // this.client.get("kamina1", redis.print);
    }

    _actions() {
        App.Hook.Action.add('Www/Init', async (args) => {
            this.buildRoutes()
            // console.log(App.plugins['Core/Www'])
        })
    }

    async _sendCommand(command, arr) {
        return new Promise((resolve, reject) => {
            this.client.internal_send_command(new Command(command, arr, (err, res) => {
                // console.log(err)
                if(err) reject(err.toString())
                resolve(res)
            }))
        })
    }

    async runCommand(cmdString) {
        let arr = cmdString.split(' ');
        // this.client.send_command('KEYS', ['*'], function(err, res) {
        //     console.log(res);
        // });

        let result = await this._sendCommand(arr[0], arr.splice(1))
        return result
        // return arr.splice(1 )
        try {
            // let result = await this.internal_send_command('KEYS', ['*'])
        } catch (error) {
            console.log(error)
        }
    }

    buildRoutes() {
        var router = express.Router();
        var routerProtected = express.Router();

        router.route('/').get((req,res,next) => {
            res.send('Module Ok')
        })

        router.route('/server_info')
            .get((req, res) => {
                
                res.send(this.client.server_info)
                // this.register(req.body).then((data) => {
                //     res.send(data)
                // }).catch((err) => {
                //     res.status(401).send(err)
                // })
        })

        router.route('/send_command')
            .get((req, res) => {
                
                // this.runCommand(req.query.cmd)
                this.runCommand(req.query.cmd).then((data) => {
                    res.send(data)
                }).catch((err) => {
                    res.status(401).send(err)
                })
        })

        App.plugins['Core/Www'].app.use('/redis-client', router)
        // this.eApp.use('/auth', [this.Middlewares.authMiddleware] ,routerProtected)
    }
}
module.exports = RedisClient