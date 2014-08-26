/*jslint browser:true */
/*jslint nomen:true */
/*global process,next,module,exports,__dirname,require,$,console,cookie,alert,Ember,jQuery,FileReader,canvas,FB*/

var auth = {};

module.exports = function () {
	"use strict";
	return auth;
};

auth.isAuthenticated = function (req, res, next) {
	"use strict";
	if (req.isAuthenticated()) {
		next();
	} else {
		res.end("handle logged out state in xhr response");
	}
};












