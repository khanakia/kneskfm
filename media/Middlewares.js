var jwt = require('jsonwebtoken');


export const authSellerMiddleware = function (req, res, next) {
	if(!req.user || req.user.role!=='seller') {
		res.status(400);
		return res.json({ success: false, message: 'Access denied seller.' });
	}

	next();
};
