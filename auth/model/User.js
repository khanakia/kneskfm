var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var mongo = require('mongodb');
const Joi = require('joi');

const UserSchema = require('../schema/User');

class User {
    constructor() {
        this._collectionName = "users"

        this.collection = App.db.collection(this._collectionName);
        this.collection.createIndex( { "email": 1 }, { unique: true } )
        this.schema = new UserSchema()
    }
  
    _createHash(password) {
        if(!password) {
            password = Math.floor(Math.random() * 90000) + 10000000
        }
        return bcrypt.hashSync(password.toString(), 10)
    }

    async generateLoginToken(user) {
        let payload = {
            _id: user._id,
            email: user.email,
            role: user.role
        }

        let result = await App.Hook.Filter.apply('Auth/LoginTokenPayload', payload, user)
        
        var token = await jwt.sign(result[0], App.plugins['Core/Auth'].config.appSecret)
        return token
    }

    async login(req) {
        try {
            let reqBody = req.body
            await App.Hook.Action.do('Auth/PreLogin', reqBody)
    
            let schema = Joi.object().keys({
                username: Joi.string().required(),
                password: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*]{3,30}$/).required(),
            });
            const result = Joi.validate(reqBody, schema, {
                stripUnknown: true
            });

            if(result.error) {
                return App.Util.Response.printError('Validation Error.', result.error.details, 401)
            }
            
            // let user = await this.findUserByUserName(result.value.username)
            let user = await this.collection.findOne({
                email: result.value.username
            })
            
            if(!user) throw (App.Util.Response.printError('User not found.'))

            if (!user.status) throw (App.Util.Response.printError('User is disabled.'))
            
            if (!bcrypt.compareSync(result.value.password, user.password)) throw (App.Util.Response.printError('Authentication failed.'))

            let token = await this.generateLoginToken(user)
            if(token.error) throw (App.Util.Response.printError('Auth failed', 'Authentication failed.'))

            var payload = {
                token: token,
                _id: user._id
            }

            await App.Hook.Action.do('Auth/Login/BeforeResponseReturn', user, req)
            return App.Util.Response.print(payload)

        } catch(e) {
            console.log(e)
            throw(e)
        }
    }


    async register(req) {
        try {
 
            let reqBody = req.body
            const result = Joi.validate(reqBody, this.schema.objRegister, {
                stripUnknown: true
            });

            if(result.error) {
                console.log(result.error)
                return (App.Util.Response.printError(result.error.details, ''))
            }

            console.log(result.value)
            
            if(reqBody.email){
                reqBody.email = reqBody.email.toLowerCase()
            }

            result.value['password'] = this._createHash(result.value['password'])

            const user = await this.collection.insertOne(result.value)
            console.log(user.ops[0])

            return App.Util.Response.print(true, result.value, 'User successfully registered.')

        } catch(e) {
            console.log(e)
            throw(e)
        }
    }

    async me(req) {
        return req.user
    }

    
}

module.exports = User