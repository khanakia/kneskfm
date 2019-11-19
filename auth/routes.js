module.exports = [
	{
		method: "POST",
		url: "/auth/login",
		handler: function(req, res) {
			App.plugins['Core/Auth'].User.login(req).then((data) => {
				res.send(data)
			}).catch((err) => {
				res.status(401).send(err)
			})
		}
	},

	{
		method: "POST",
		url: "/auth/register",
		handler: function(req, res) {
			App.plugins['Core/Auth'].User.register(req).then((data) => {
				res.send(data)
			}).catch((err) => {
				res.status(401).send(err)
			})
		}
	},

	{
		method: "POST",
		url: "/auth/me",
		preHandler: async (request, reply) => {
			// E.g. check authentication
			return App.plugins['Core/Auth'].Middlewares.authMiddleware(request, reply)
		},
		handler: function(req, res) {
			App.plugins['Core/Auth'].User.me(req).then((data) => {
				res.send(data)
			}).catch((err) => {
				res.status(401).send(err)
			})
		}
	}
];
