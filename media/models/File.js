// var mongo = require('mongodb');
// var ObjectId = mongo.ObjectId;

const Schema = require('../schemas/File')
class File {
    constructor() {
        this._collectionName = "files"

        this.collection = Db.collection(this._collectionName);
        this.schema = new Schema()
    }

    // async getUrlsByIds(ids=[]) {
    //     let urls = []
    //     let newIds = []
        
    //         ids.forEach((id) => {
    //             newIds.push(new ObjectId(id))
    //         })
        
    //     // console.log(newIds)
    //     const items = await Sapp.JgAttachment.Attachment.collection.find({_id: {
    //         "$in": newIds
    //     }}).toArray()

    //     for(let item of items) {
    //         urls.push(Sapp.config.host + '/' + item.file)
    //     }
        
    //     // console.log(urls)
    //     return urls
    // }
}

module.exports = new File()