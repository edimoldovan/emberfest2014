/*jslint node:true */
/*jslint nomen:true */
/*global Handlebars,Layout,module,exports,__dirname,require,$,console,cookie,alert,Ember,jQuery,FileReader,canvas,FB*/

var url = require("url"),
	https = require("https"),
	base64url = require("base64url"),
	btoa = require("btoa"),
	async = require("async"),
	controller = {},
	google,
	gmail,
	OAuth2,
	oauth2Client;

module.exports = function(app) {
	"use strict";
	google = require("googleapis");
	gmail = google.gmail("v1");
	OAuth2 = google.auth.OAuth2;
	oauth2Client = new OAuth2(app.config.get("passport:google:clientID"), app.config.get("passport:google:clientSecret"), app.config.get("passport:google:callbackURL"));
	
	app.documents = require("../../application/models/documents") (app);
	controller.app = app;

	return controller;
};

controller.create = function(req, res, callback) {
	"use strict";
	var message = req.body.message;

	// message.raw = base64url(message.body);
	// message.raw = btoa(message.body);
	message.raw = new Buffer(message.body).toString("base64");
	
	oauth2Client.setCredentials({
		access_token: req.user.accessToken// ,
		// refresh_token: 'REFRESH TOKEN HERE'
	});

    gmail.users.messages.send({
		/*message: {
			raw: message.raw
		},*/
		userId: req.user.email,
		message: {
			raw: "UmV0dXJuLVBhdGg6IDxoaW1zZWxmQGVkdWFyZG1vbGRvdmFuLmNvbT4NClJlY2VpdmVkOiBmcm9tIFsxMC4wLjEuN10gKGNhdHYtODAtOTktNzItMi5jYXR2LmJyb2FkYmFuZC5odS4gWzgwLjk5LjcyLjJdKQ0KICAgICAgICBieSBteC5nb29nbGUuY29tIHdpdGggRVNNVFBTQSBpZCB4MTFzbTg2NzcyMjkzd2pyLjE1LjIwMTQuMDguMjMuMTYuMDEuNDINCiAgICAgICAgZm9yIDxoaW1zZWxmQGVkdWFyZG1vbGRvdmFuLmNvbT4NCiAgICAgICAgKHZlcnNpb249VExTdjEgY2lwaGVyPVJDNC1TSEEgYml0cz0xMjgvMTI4KTsNCiAgICAgICAgU2F0LCAyMyBBdWcgMjAxNCAxNjowMTo0MiAtMDcwMCAoUERUKQ0KRGF0ZTogU3VuLCAyNCBBdWcgMjAxNCAwMTowMTo0MSArMDIwMA0KRnJvbTogRWR1YXJkIE1vbGRvdmFuIDxoaW1zZWxmQGVkdWFyZG1vbGRvdmFuLmNvbT4NClRvOiA9P3V0Zi04P1E_RWR1PUMzPUExcmRfTW9sZG92PUMzPUExbj89IDxoaW1zZWxmQGVkdWFyZG1vbGRvdmFuLmNvbT4NCk1lc3NhZ2UtSUQ6IDw0MzRCMjFGMjRFNTc0QzNGOTg4Qzg1M0Q0ODE5MkM0NEBlZHVhcmRtb2xkb3Zhbi5jb20-DQpTdWJqZWN0OiB0ZXN0DQpYLU1haWxlcjogc3BhcnJvdyAxLjYuNCAoYnVpbGQgMTE3NikNCk1JTUUtVmVyc2lvbjogMS4wDQpDb250ZW50LVR5cGU6IG11bHRpcGFydC9hbHRlcm5hdGl2ZTsgYm91bmRhcnk9IjUzZjkxZDU1XzYwYjZkZjcwXzE4MyINCg0KLS01M2Y5MWQ1NV82MGI2ZGY3MF8xODMNCkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD0idXRmLTgiDQpDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiA3Yml0DQpDb250ZW50LURpc3Bvc2l0aW9uOiBpbmxpbmUNCg0KdGVzdA0KDQotLTUzZjkxZDU1XzYwYjZkZjcwXzE4Mw0KQ29udGVudC1UeXBlOiB0ZXh0L2h0bWw7IGNoYXJzZXQ9InV0Zi04Ig0KQ29udGVudC1UcmFuc2Zlci1FbmNvZGluZzogcXVvdGVkLXByaW50YWJsZQ0KQ29udGVudC1EaXNwb3NpdGlvbjogaW5saW5lDQoNCg0KICAgICAgICAgICAgICAgICAgICB0ZXN0DQotLTUzZjkxZDU1XzYwYjZkZjcwXzE4My0tDQoNCg=="
		},	
		auth: oauth2Client
	}, function(error, message) {
		if (error) {
			callback(error);
			console.log(error);
		} else {
			callback(message);
			console.log(message);
		}
	});

};

















