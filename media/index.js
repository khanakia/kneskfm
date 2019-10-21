var express = require('express');

const _config = require('./config')
class Media {
    constructor(config = {}) {
        this.config = Object.assign({}, _config, config||{});

        this.Models = {
            File: require('./models/File')
        }

        this.Libraries = {
            Upload: require('./libraries/Upload')(this.config.upload||{})
        }

        this.Controllers = {
            File: require('./controllers/FileC')
        }

        this.Routes = {
            private : require('./routes/private')
        }
        

        this.uploadBucket= {}
        this.uploadBucket['public'] = this.Libraries.Upload.upload('public')

        this._actions()
    }

    async init() {
        await Kapp['Core/Hook'].Action.do('Media/Init')

        // Kapp['Core/Hook'].Filter.add('Media/FileName', (data) => {
        //     data.fileName = 'sdf.png'
        //     // return data
        // })

        // Kapp['Core/Hook'].Filter.add('Media/Destination', function(payload) {
        //     // dest = 'uploads/aman'
        //     // return [(dest, lname)]
        //     payload.dest = 'uploads/aman'
        //     return payload
        // })
    }

    _actions() {
        Kapp['Core/Hook'].Action.add('Www/Init', async (args) => {
            this.buildRoutes()
        })
    }

    buildRoutes() {
        const {authMiddleware} = Kapp['Core/Auth'].Middlewares
        Kapp['Core/Www'].app.use('/media', [authMiddleware], this.Routes.private)
    }
}

module.exports = (config) => new Media(config)