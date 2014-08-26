/*jslint node:true */
/*jslint nomen:true */
/*global Handlebars,Layout,module,exports,__dirname,require,$,console,cookie,alert,Ember,jQuery,FileReader,canvas,FB*/

var url = require("url"),
	https = require("https"),
	base64url = require("base64url"),
	async = require("async"),
	controller = {},
	documents,
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
	documents = require("../../application/models/documents") (app);
	controller.app = app;

	return controller;
};

controller.findAll = function(req, res, callback) {
	"use strict";
	var threads = [],
		htmlMessages,
		textMessages;

	if (req.user) {

		oauth2Client.setCredentials({
			access_token: req.user.accessToken// ,
			// refresh_token: 'REFRESH TOKEN HERE'
		});

		gmail.users.threads.list({
			userId: req.user.email,
			maxResults: 100,
			auth: oauth2Client
		}, function(error, threadList) {
			if (error) {
				console.log(error);
			}

			async.eachSeries(threadList.threads, function(thread, anotherCallback) {

				var newThread = {};

				gmail.users.threads.get({
					userId: req.user.email,
					id: thread.id,
					auth: oauth2Client
				}, function(error, threadDetail) {
					if (error) {
						console.log(error);
					}

					// console.log(threadDetail);

					if (threadDetail.messages[0].labelIds) {
						if (threadDetail.messages[0].labelIds.indexOf("INBOX") >= 0) {

							newThread.snippet = threadDetail.messages[0].snippet;

							threadDetail.messages[0].payload.headers.filter(function(header) {
								if (header.name === "Subject") {
									newThread._id = thread.id;
									newThread.subject = header.value;
								}
								if (header.name === "Date") {
									newThread.date = header.value;
								}
								if (header.name === "From") {
									newThread.from = header.value;
								}
							});

							htmlMessages = [];
							textMessages = [];
							threadDetail.messages.forEach(function(message) {
								if (message.payload.parts) {
									message.payload.parts.forEach(function(part) {
										if (part.mimeType === "text/html") {
											if (part.body.data) {
												htmlMessages.push(base64url.decode(part.body.data));
											} else {
												// console.log(part.body);
											}
										} else if (part.mimeType === "text/plain") {
											if (part.body.data) {
												textMessages.push(base64url.decode(part.body.data));
											} else {
												// console.log(part.body);
											}
										}
									});
								} else {
									textMessages.push(base64url.decode(message.payload.body.data));
								}
							});

							newThread.htmlMessages = htmlMessages;
							newThread.textMessages = textMessages;
							threads.push(newThread);

							documents.create("threads", newThread, function(thr) {
								// console.log(thr);
							});


							anotherCallback();
							
						} else {
							anotherCallback();
						}
						
					} else {
						anotherCallback();
					}
					
					
				});

			}, function(error) {
				callback(threads);
			});

			/*gmail.users.messages.get({
				userId: req.user.email,
				id: "147f2c68eeab77b9",
				auth: oauth2Client
			}, function(error, message) {
				console.log(message);
			});*/
		});
	}
};

















