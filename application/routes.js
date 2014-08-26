/*jslint browser:true */
/*jslint nomen:true */
/*global process,∆next,module,exports,__dirname,require,$,console,cookie,alert,Ember,jQuery,FileReader,canvas,FB*/

module.exports = function(app) {
	"use strict";
	var passport = require("passport"),
		layout = require("../application/controllers/layout") (app),
		githubController = require("../application/controllers/github") (app),
		auth = require("../application/controllers/auth") (app),
		documents = require(__dirname + "/models/documents") (app),
		config = app.config,

		namespaces = {
			users: {
				singular: "user",
				plural: "users",
				controller: {
					create: false,
					update: false,
					findOne: false,
					findAll: false,
					delete: false
				}
			},
			threads: {
				singular: "thread",
				plural: "threads",
				controller: {
					create: false,
					update: false,
					findOne: false,
					findAll: false,
					delete: false
				}
			},
			messages: {
				singular: "message",
				plural: "messages",
				controller: {
					create: true,
					update: false,
					findOne: false,
					findAll: false,
					delete: false
				}
			},
			projects: {
				singular: "project",
				plural: "projects",
				controller: {
					create: false,
					update: false,
					findOne: false,
					findAll: false,
					delete: false
				}
			}
		};

	app.get(config.get("passport:google:authURL"), passport.authenticate("google", {
		access_type: "offline",
		approval_prompt: "force",
		scope: ["profile", "email", "https://mail.google.com/"]
	}));

	app.get(config.get("passport:google:callbackURL"), passport.authenticate("google", 
		{
			failureRedirect: config.get("passport:google:failureRedirect")
		}
	), function(req, res) {
			res.redirect(config.get("passport:google:successRedirect"));
		}
	);

	app.get("/logout", function(req, res){
		req.logout();
		res.redirect('/');
	});

	app.all(config.get("api:rest:baseURL") + "/*", auth.isAuthenticated, function(req, res, next) {
		res.header("Content-Type", "application/json; charset=utf-8");
		next();
	});

	app.get(config.get("api:rest:baseURL") + "/:namespace", auth.isAuthenticated, function(req, res, next) {
		var controller,
			output = {};

		if (namespaces[req.params.namespace].controller.findAll) {
			controller = require(__dirname + "/controllers/" + namespaces[req.params.namespace].singular) (app);
			controller.findAll(req, res, function(results) {
				output[namespaces[req.params.namespace].plural] = results;
				res.end(JSON.stringify(output));
			});
		} else {
			documents.findAll(req.params.namespace, {}, 100000, function(results) {
				output[namespaces[req.params.namespace].plural] = results;
				res.end(JSON.stringify(output));
			});
		}
	});

	app.get(config.get("api:rest:baseURL") + "/:namespace/:id", auth.isAuthenticated, function(req, res, next) {
		var controller,
			output = {};

		if (namespaces[req.params.namespace].controller.findOne) {
			controller = require(__dirname + "/controllers/" + namespaces[req.params.namespace].singular) (app);
			controller.findAll(req, res, function(results) {
				output[namespaces[req.params.namespace].plural] = results;
				res.end(JSON.stringify(output));
			});
		} else {
			documents.findOne(req.params.namespace, req.params.id, function(results) {
				output[namespaces[req.params.namespace].plural] = results;
				res.end(JSON.stringify(output));
			});
		}
	});

	app.post(config.get("api:rest:baseURL") + "/:namespace", auth.isAuthenticated, function(req, res, next) {
		var controller,
			output = {};

		if (namespaces[req.params.namespace].controller.create) {
			controller = require(__dirname + "/controllers/" + namespaces[req.params.namespace].singular) (app);
			controller.create(req, res, function(results) {
				output[namespaces[req.params.namespace].plural] = results;
				res.end(JSON.stringify(output));
			});
		} else {
			documents.create(req.params.namespace, req.body[namespaces[req.params.namespace].singular], function(results) {
				output[namespaces[req.params.namespace].plural] = results;
				res.end(JSON.stringify(output));
			});
		}
	});

	app.put(config.get("api:rest:baseURL") + "/:namespace/:id", auth.isAuthenticated, function(req, res, next) {
		var controller,
			output = {};

		if (namespaces[req.params.namespace].controller.create) {
			res.end("Unused");
		} else {
			documents.update(req.params.namespace, req.params.id, req.body[namespaces[req.params.namespace].singular], function(results) {
				output[namespaces[req.params.namespace].plural] = results;
				res.end(JSON.stringify(output));
			});
		}
	});

	app.delete(config.get("api:rest:baseURL") + "/:namespace/:id", auth.isAuthenticated, function(req, res, next) {
		var controller,
			output = {};

		if (namespaces[req.params.namespace].controller.create) {
			res.end("Unused");
		} else {
			documents.delete(req.params.namespace, req.params.id, function(results) {
				output[namespaces[req.params.namespace].plural] = results;
				res.end(JSON.stringify(output));
			});
		}
	});

	app.post("/_github-webhook/", function(req, res) {
		githubController.pull(req, res);
	});

	app.get("*", function(req, res) {

		layout.render(req, res);
	});

};









