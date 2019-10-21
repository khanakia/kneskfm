var express = require('express');
var router = express.Router();
const uuidv4 = require('uuid/v4');
const multer = require('multer')
var path = require('path');

router.route('/').post((req,res) => {
    const uploadFile = Kapp['Core/Media'].uploadBucket['public'].single('file') 
    uploadFile(req, res, async (err) => {
        if (err) {
            return res.status(401).send({
                error: err.message
            })
        }

        // console.log(Kapp['Core/Media'].Models.File)
        let fileRecord = await Kapp['Core/Media'].Models.File.collection.insertOne({
            createdAt: new Date(),
            filename: req.file.filename,
            file: req.file.path,
            user: req.user._id
        })

        fileRecord = fileRecord.ops[0]

        // let fileUrl = Sapp.config.cloudfrontHost +'/' +req.file.filename
        // let fileUrl = req.file.path
        res.send(fileRecord)
    })
})


// router.route('/attachment/list')
//     .get((req, res) => {
//         Sapp.JgAttachment.AttachmentC.list().then((data) => {
//             res.send(data)
//         }).catch((err) => {
//             res.status(401).send(err)
//     })
// })

// router.route('/attachment/list_filter')
//     .post((req, res) => {
//         //console.log(req.body)
//         Sapp.JgAttachment.AttachmentC.listFilter(req.body).then((data) => {
//             res.send(data)
//         }).catch((err) => {
//             res.status(401).send(err)
//     })
// })

// router.route('/attachment/:id')
//     .delete((req, res) => {
//         Sapp.JgAttachment.AttachmentC.deleteAttachment(req.params.id).then((data) => {
//             res.send(data)
//         }).catch((err) => {
//             res.status(401).send(err)
//     })
// })


module.exports = router;