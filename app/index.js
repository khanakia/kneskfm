const MongoClient = require('mongodb').MongoClient;

const hook = require('@knesk/hook')
const util = require('@knesk/util')
const joi = require('@knesk/joi');
const option = require('@knesk/option');

function App(config={}) {
    this.plugins = {}
	this.db = null
	
    this.Hook = new hook()
    this.Util = new util()
	this.Joi = new joi()

    this.config = Object.assign({}, {
    	plugins: [],
    	db: {}
    }, config)
}

App.prototype.bootstrap = async function() {
	// console.log(this.config)
	await this.loadDB()

	const Option = new option({
		db: this.db
	})
	await Option.init()
	this.Option = Option

	await this.loadPlugins()
	await this.initPlugins()
}

App.prototype.loadPlugins = async function() {
	for (let plugin of this.config.plugins||[]) {
		// console.log(plugin)
		try {	
			let _require = require(plugin.path);
			let initNew = new _require(plugin.config||{})
			this.plugins[plugin.name] = initNew
		} catch (error) {
			console.log(error)
		}
	}
}

App.prototype.initPlugins = async function() {
	for (let plugin of this.config.plugins||[]) {
		try {
			const pluginC = this.plugins[plugin.name]
			if(pluginC==undefined) continue
			
			if(typeof(pluginC.init)=='function') {
				await pluginC.init()
			}
		} catch (error) {
			console.log(error)
		}
	}
}

App.prototype.loadDB = async function() {
	const config = Object.assign({}, {
		uri: 'mongodb://127.0.0.1:27017',
        name: 'kneskdb',
        options: {
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        }
	}, this.config.db)

    const dbconn = await MongoClient.connect(
        config.uri, config.options
    )
    this.db = dbconn.db(config.name)

	this.dbconn = dbconn

    await this.Hook.Action.do('Db/AfterInit')
}

module.exports = App