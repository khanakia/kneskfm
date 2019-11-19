const _config = require('./config')

const User = require('./model/User');

const Routes = require('./routes')
const fastify = require('fastify')
const Middlewares = require('./middlewares')

class Auth {
    constructor(config={}) {    
        this.config = Object.assign({}, _config, config||{});

        this.Middlewares = Middlewares
        this.User = new User()

        this._actions()
    }
    
    async init() {
        
    }

    _actions() {
        
        App.Hook.Action.add('Www/Init', async (fastify) => {
            // console.log(fastify.route)
            // for (const route of Routes) {
            //     fastify.route(route)
            // }
        })
    }

    getMethods() {
        let methods = {
            'auth.login' : {
                handler : (body) => {
                    console.log('handler', body)
                    return body
                }
            },
            'auth.register' : {
                handler : (body) => {
                    console.log('handler', body)
                    return body
                }
            }
        }

        return methods
    }
}

// module.exports = (config) => new Auth(config)
module.exports = Auth