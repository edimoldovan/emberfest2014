/*jslint node:true */
/*jslint nomen:true */
/*global Handlebars,Layout,module,exports,__dirname,require,$,console,cookie,alert,Ember,jQuery,FileReader,canvas,FB*/

var controller = {},
	shell = require("shelljs");

module.exports = function() {
	"use strict";
	return controller;
};

controller.pull = function(req, res) {
	"use strict";
	var commands;

	commands = [
		"echo $PWD",
		"git reset --hard HEAD",
		"git pull",
		"git status",
		"git submodule sync",
		"git submodule update",
		"git submodule status",
		"cd /var/www/skilldriller/",
		"npm install",
		"/var/www/skilldriller/init-script/node-skilldriller stop",
		"/var/www/skilldriller/init-script/node-skilldriller start"
	];

	commands.forEach(function(c) {
		shell.echo(shell.exec(c));
	});

	res.end();
};
