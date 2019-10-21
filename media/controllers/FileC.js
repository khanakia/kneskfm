const Joi = require('joi');
var mongo = require('mongodb');
const uuidv4 = require('uuid/v4');
const multer = require('multer');
var path = require('path');
var fs = require('fs')

class Media {
    constructor() {
    }

    async save(reqBody){
        try {
            let data = {
                user: USER._id,
                file: reqBody.destination + "/" + reqBody.filename,
                filename: reqBody.filename,
                size: reqBody.size,
                ext: path.extname(reqBody.originalname),
                mimetype: reqBody.mimetype,
                originalname: reqBody.originalname
            }
            //console.log(data)
            const result = Joi.validate(data, Sapp.JgAttachment.Attachment.schema.default);

            if(result.error) {
                return Sapp.Util.Response.print(false, result.error.details, '')
            }
            
            let attachment = await Sapp.JgAttachment.Attachment.collection.insertOne(result.value)
            attachment = attachment.ops[0]
            return Sapp.Util.Response.print(true, {attachmentId: attachment._id}, 'Attachment successfully  saved.')

        } catch(e) {
            console.log(e)
            throw(e)
            
        }
       
        
    }

    // async save(reqBody){
    //     for(let image of reqBody)
    //     {
    //         try {
    //             let data = {
    //                 user: USER._id,
    //                 file: image.destination + "/" + image.filename,
    //                 filename: image.filename,
    //                 size: image.size,
    //                 ext: path.extname(image.originalname),
    //                 mimetype: image.mimetype,
    //                 originalname: image.originalname
    //             }
    //             console.log(data)
    //             const result = Joi.validate(data, Sapp.JgAttachment.Attachment.schema.default);
    
    //             if(result.error) {
    //                 return Sapp.Util.Response.print(false, result.error.details, '')
    //             }
                
    //             const attachment = await Sapp.JgAttachment.Attachment.collection.insertOne(result.value)
    
    
    //         } catch(e) {
    //             console.log(e)
    //             throw(e)
                
    //         }

    //     }
    //     //return Sapp.Util.Response.print(true, {fileName: data.filename}, 'Attachment successfully  saved.')
       
        
    // }

    // async list(){
    //     try {
    //         const attachment = await Sapp.JgAttachment.Attachment.collection.find({user: USER._id}).toArray()
    //         return attachment
    //     } catch(e) {
    //         console.log(e)
    //         throw(e)            
    //     }     
    // }

    async list(args = {}) {
        try {
            
            let atts = Object.assign({}, {
                'sortField' : 'createdAt',
                'sortOrder' : -1,
                'results' : 200,
                'page' : 1,
                'filters' : {}
    
            }, args);
    
            for (var key in atts.filters) {
                if (!atts.filters[key] || atts.filters[key].length == 0 || atts.filters[key] == '') delete atts.filters[key]
                // console.log(typeof atts.filters[key])
                if (typeof atts.filters[key] == 'object') {
                    atts.filters[key] = {
                        $in: atts.filters[key]
                    }
                } else {
                    atts.filters[key] = { $regex : new RegExp(atts.filters[key], "i") }
                }
            }

            let query = [

                {
                    $lookup:
                       {
                          from: "users",
                          localField: "user",
                          foreignField: "_id",
                          as: "usersdeatial"
                     },
                },
                 
                {
                     $unwind: {
                        path: "$usersdeatial",
                        preserveNullAndEmptyArrays: true
                    },
                },
    
                { 
                    $project : { 
                        _id : 1 ,
                        createdAt : 1,
                        originalname: 1,
                        size:1,
                        file: 1,
                        userName: { $concat: [ "$usersdeatial.firstName"," ", "$usersdeatial.lastName" ] },
                    }
                },
    
    
                {
                    $match: atts.filters
                },
    
            ]
                
    
            let totalRecords = await Sapp.JgAttachment.Attachment.collection.aggregate([...query, ...[{
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        count: 1
                    }
                }
            ]]).toArray()

            // return totalRecords
    
            totalRecords = Sapp.Util.objValue(totalRecords[0], ['count'], 0)
    
            let sortOrder = atts.sortOrder=='descend' ? -1 : atts.sortOrder
            sortOrder = sortOrder=='ascend' ? 1 : sortOrder
            
            const data = await Sapp.JgAttachment.Attachment.collection.aggregate([...query,
                {
                    $sort: {
                        'createdAt': -1
                    }
                },
                {
                    $skip: parseInt(atts.page - 1) * parseInt(atts.results)
                },
                {
                    $limit: parseInt(atts.results)
                },
            ]).toArray()
        
            return Sapp.Util.Response.print(true, {
                results: data,
                "total": totalRecords,
                "per_page": atts.limit,
                "current_page": atts.offset
            })
        } catch(e) {
            console.log(e)
            throw(e)
        }


        
        // var result = await  await Sapp.JgAttachment.Attachment.collection.find(atts.filters).toArray()
        // return {
        //     results: result
        // }
    }
    
    async show(itemId) {
        try {
            // return result.value
            var o_id = new mongo.ObjectID(itemId);
            const itemEnquiry = await Sapp.JgAttachment.Attachment.collection.findOne({_id: o_id})
            // console.log(item)

            return Sapp.Util.Response.print(true, itemEnquiry)

        } catch(e) {
            console.log(e)
            throw(e)   
        }
    }

    async deleteAttachment(id) {
        try {
            // return result.value
            var o_id = new mongo.ObjectID(id);
            const attachment = await Sapp.JgAttachment.Attachment.collection.findOne({_id: o_id, user: USER._id})
            if(attachment){
                console.log(attachment)
                try {
                    var filePath = attachment.file 
                    fs.unlinkSync(filePath);
                    await Sapp.JgAttachment.Attachment.collection.removeOne({_id: o_id}) 
                } catch (error) {
                    console.log(error)
                }
               
            }

            // return Sapp.Util.Response.print(true, itemEnquiry)

        } catch(e) {
            console.log(e)
            throw(e)   
        }
    }

    async listFilter(reqBody){
        let atts = Object.assign({},{
            ids: []
        },reqBody)
        try {
            let mongoIds = []
            atts.ids.map((id)=>{
                mongoIds.push(new mongo.ObjectId(id))
            })
            const attachments = await Sapp.JgAttachment.Attachment.collection.find({user: USER._id, _id: {
                "$in": mongoIds
            }}).toArray()
            return attachments
        } catch(e) {
            console.log(e)
            throw(e)            
        }     
    }

    hello() {
        console.log('hello')
    }

}


module.exports = Media