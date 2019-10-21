var jwt = require('jsonwebtoken');
var mongo = require('mongodb');

// getToken(req) {
// 	var header = req.headers.authorization.split(' ');
// 	var token = header[1];
// }
exports.authMiddleware = async (req, res, next) => {
	if (!req.headers.authorization) {
		res.status(400);
		return res.send(App.Util.Response.print('No crendentials sent.'));
	}

	var header = req.headers.authorization.split(' ');
	var token = header[1];
	if (token) {
		jwt.verify(token, App.plugins['Core/Auth'].config.appSecret, function (err, decoded) {
			if (!err) {
				// console.log(decoded)
				req.decoded = decoded;
				// USERID = parseInt(decoded.id)
				req.user = decoded
			}
		});

	} else {
		// if there is no token
		// return an error
		return res.status(403).send({ 
		    success: false, 
		    message: _e('Please log in first.', 'Core/Auth')
		});
	}

	if(!req.user) {
		return res.status(400).send({ 
		    success: false, 
		    message: 'Please log in first'
		});
	}
	
	var o_id = new mongo.ObjectID(req.user._id);

	const user =  await App.plugins['Core/Auth'].User.collection.findOne({"_id" : o_id})
	if(!user) {
		return res.status(403).send({ 
		    success: false, 
		    message: 'User not found.'
		});
	}

	if(user && !user.status) {
		return res.status(403).send({ 
		    success: false, 
		    message: 'User is disabled.'
		});
	}
};
