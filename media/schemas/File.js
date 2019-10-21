class File {
    constructor(args={}, config={}) {
        Object.assign(this, {

        }, args)

        const Joi = Kapp['Core/Joi']

        this.filename = Joi.string()
        this.file = Joi.string()
        this.user = Joi.objectId()
        this.sizes = Joi.array()

        this.default = Joi.object().keys({
            filename: this.filename.required(),
            file: this.file.required(),
            user: this.user.required(),
            sizes: this.sizes
        });

        this.add = this.default.keys({
            createdAt: Joi.date().default(new Date(), 'time of creation')
        });
        
    }
}

module.exports = File