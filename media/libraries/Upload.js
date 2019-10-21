var multer  = require('multer')
// const uuidv4 = require('uuid/v4');
// const fs = require('fs');
const path = require('path');

class Upload {
    constructor(config = {}) {
        this.config = Object.assign({}, {
            organizeIntoMothYear: true,
            uploadDir: 'uploads',
            allowedExt: ['.png', '.jpg', '.gif', '.jpeg']
        }, config)
     
        
        this.storage = []
        this.storage['public'] = multer.diskStorage({
            destination: async (req, file, cb) => {
                let dest = this.config.uploadDir + '/public'
                if(this.config.organizeIntoMothYear) {
                    dest = this.getDest(dest)
                }

                let result = await Kapp['Core/Hook'].Filter.apply('Media/Destination', {
                    file: file,
                    storage: 'public',
                    dest: dest,
                })
                dest = result.dest||dest

                Kapp['Core/Util'].mkDirByPathSync(dest)
                cb(null, dest)
            },
            filename: async (req, file, cb) => {
                let ext = path.extname(file.originalname);
                let fileName = Kapp['Core/Util'].makeid(10) + ext 
                fileName = fileName.toLowerCase()
                
                let resultFilter = await Kapp['Core/Hook'].Filter.apply('Media/FileName', {
                    file: file,
                    storage: 'public',
                    ext: ext,
                    fileName: fileName
                })

                // console.log(resultFilter)

                fileName = resultFilter.fileName||fileName

                cb(null, fileName)
                
            }
        })

    }

    getDest(path) {
        let year = new Date().getFullYear()
        let month = new Date().getMonth()+1
        // let dest = `uploads/public/${year}/${month}`
        let dest = path + `/${year}/${month}`
        return dest
    }

    upload(storageName) {
        return multer({ 
                storage: this.storage[storageName], 
                fileFilter: (req, file, callback) => {
                    // console.log(file)
                    let ext = path.extname(file.originalname);
                    ext = ext.toLowerCase()
                    
                    console.log(this.config.allowedExt, ext)
                    if(this.config.allowedExt.indexOf(ext)==-1) {
                        return callback(new Error('Ext not allowed.'))
                    }
                    // if(ext !== '.pdf' && ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG' ) {
                    //     return callback(new Error('Only images are allowed'))
                    //     // return callback(())
                    // }
                    callback(null, file)
                } 
            })
    }
}


module.exports = (config) => new Upload(config)