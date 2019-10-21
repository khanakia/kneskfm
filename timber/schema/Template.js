module.exports = class PropertySchema {
    constructor(args={}, config={}) {
        Object.assign(this, {

        }, args)

        const Joi = App.Joi

        this.default = Joi.object().keys({
            title: Joi.string().required(),
            key: Joi.string().required(true),
            body: Joi.string(),
            group: Joi.any().default('default')
        }); 

        this.add = this.default.keys({
            createdAt: Joi.date().default(new Date(), 'time of creation')
        });
    }
}