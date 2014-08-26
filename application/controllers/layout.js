/*jslint node:true */
/*jslint nomen:true */
/*global passport,process,Handlebars,Layout,module,exports,__dirname,require,$,console,cookie,alert,Ember,jQuery,FileReader,canvas,FB*/

var controller = {},
	globalApp;

module.exports = function(app) {
	"use strict";
	globalApp = app;
	return controller;
};

controller.render = function(req, res) {
	"use strict";
	var handlebars = require("handlebars"),
		fs = require("fs"),
		output = "",
		currentLayout,
		currentUser = {},
		url = req.url.replace(/^\/|\/$/g, ""),
		urlArray = url.split("/"),
		appType = (urlArray[0] === "_private") ? "private" : "public";

	if (url === "") {
		url = "index";
	}

	if (req.user) {
		req.login(req.user, {}, function(err) {
			//console.log(err);
		});
		currentUser = req.user;
		currentUser.password = null;
	}

	res.set({
		"Content-Type": "text/html; charset=utf-8"
	});

	if (globalApp.config.get("env:development")) {
		output += handlebars.compile(fs.readFileSync(globalApp.config.get("app:folder") + "/application/views/" + appType + "/site-header.hbs", "utf8"))({
			title: globalApp.config.get(appType + ":title"),
			stylesheets: globalApp.config.get(appType + ":stylesheets"),
			user: currentUser
		});
	} else {
		output += handlebars.compile(fs.readFileSync(globalApp.config.get("app:folder") + "/application/views/" + appType + "/site-header.hbs", "utf8"))({
			title: globalApp.config.get(appType + ":title"),
			stylesheets: globalApp.config.get(appType + ":stylesheets"),
			user: currentUser
		});
	}

	currentLayout = globalApp.config.get(appType + ":layouts").filter(function(layout) {
		if (layout.url === url) {
			layout.templates.forEach(function(template) {
				if (template.type === "include") {
					output += fs.readFileSync(globalApp.config.get("app:folder") + "/application/views/" + appType + "/" + template.name + ".hbs", "utf8");
				} else {
					output += handlebars.compile(fs.readFileSync(globalApp.config.get("app:folder") + "/application/views/" + appType + "/" + template.name + ".hbs", "utf8"))({
						user: currentUser
					});
				}
			});
		}
	})[0];

	if (globalApp.config.get("env:development")) {
		output += handlebars.compile(fs.readFileSync(globalApp.config.get("app:folder") + "/application/views/" + appType + "/site-footer.hbs", "utf8"))({
			javascripts: globalApp.config.get(appType + ":javascripts"),
			user: currentUser
		});
	} else {
		output += handlebars.compile(fs.readFileSync(globalApp.config.get("app:folder") + "/application/views/" + appType + "/site-footer.hbs", "utf8"))({
			javascripts: globalApp.config.get(appType + ":javascripts"),
			user: currentUser
		});
	}

	res.end(output);
};





















