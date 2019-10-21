var mongo = require('mongodb');
const Schema = require('../schema/Template');
class Template {
    constructor(args={}, config={}) {
        this._collectionName = "timber_templates"

        this.collection = App.db.collection(this._collectionName);

        this.collection.createIndex( { "key": 1, "group" : 1 }, { unique: true } )

        this.schema = new Schema()
    }
}

module.exports = Template