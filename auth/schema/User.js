const Joi = require('joi');
// const Schema = require('../../orm/schema')

class User {
    constructor() {

        this.email = Joi.string().email({ minDomainAtoms: 2 }).lowercase()
        this.password = Joi.string()
        this.name = Joi.string()
        this.status = Joi.boolean().default(true)

        this.objDefault = {
            name: this.name,
            email: this.email,
            password: this.password,
            status: this.status
        }

        this.objRegister = {
            name: this.name,
            email: this.email.required(),
            password: this.password.regex(/^[a-zA-Z0-9]{3,30}$/).required()
        }
    }


   
}

module.exports = User