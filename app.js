/*jslint browser:true */
/*jslint nomen:true */
/*global process,EventEmitter,__dirname,require,$,console,cookie,alert,Ember,jQuery,FileReader,canvas,FB*/

var env = process.env.NODE_ENV || "development",

	mongo = require("mongodb"),
	MongoClient = mongo.MongoClient,

	express = require("express"),
	compress = require("compression")(),
	cookieParser = require("cookie-parser"),
	session = require("express-session"),
	confit = require("confit"),
	MongoStore = require("connect-mongo")({session: session}),
	morgan = require("morgan"),
	bcrypt = require("bcrypt-nodejs"),
	bodyParser = require("body-parser"),
	consolidate = require("consolidate"),
	sass = require("node-sass"),
	minify = require("express-minify"),
	passport = require("passport"),
	GoogleStrategy = require("passport-google-oauth").OAuth2Strategy

	documents = require("application/models/documents") (),

	app = express(),
	basedir = __dirname + "/config";

confit(basedir).create(function (error, config) {

	app.config = config;

	MongoClient.connect(config.get("mongoDb:connectString"), function(error, db) {
		if (error) {
			throw error;
		}

		config.get("mongoDb:indexes").forEach(function(index) {
			collection = db.collection(index.collection);

			if (index.expireAfterSeconds) {
				collection.ensureIndex(index.index, {expireAfterSeconds: index.expireAfterSeconds},function(ensureError) {
					if (ensureError) {
						throw ensureError;
					}
				});
			} else {
				collection.ensureIndex(index.index, function(ensureError) {
					if (ensureError) {
						throw ensureError;
					}
				});
			}
			
		});
	});

	passport.serializeUser(function(user, callback) {
		"use strict";
		callback(null, user);
	});

	passport.deserializeUser(function(user, callback) {
		"use strict";
		callback(null, user);
	});

	passport.use(new GoogleStrategy({
			clientID: config.get("passport:google:clientID"),
	    	clientSecret: config.get("passport:google:clientSecret"),
	    	callbackURL: config.get("passport:google:callbackURL"),
		},
		function(accessToken, refreshToken, profile, done) {
			var newUser = profile._json;

			newUser.googleID = newUser.id;
			newUser.provider = profile.provider;
			newUser.accessToken = accessToken;
			newUser.refreshToken = refreshToken;
			delete newUser.id;

			documents.upsert("users", {email: profile._json.email}, newUser, function() {
				documents.findAll("users", {email: profile._json.email}, 1, function(users) {
					return done(null, users[0]);
				});
			});
		}
	));

	app.set("view engine", "handlebars");
	app.engine("handlebars", consolidate.handlebars);
	app.set("views", __dirname + "/application/");

	if (config.get("env:development")) {

		app.use(morgan(config.get("morgan:format"), {
				immediate: true
			})
		);

		app.use(sass.middleware({
				src: __dirname,
				dest: __dirname,
				outputStyle: "compressed",
				debug: true
			})
		);
	} else {
		app.use(compress());
	}

	config.get("static").forEach(function(folder) {
		app.use(folder, express["static"](__dirname + folder));
	});

	app.use(cookieParser());
	app.use(bodyParser.json(config.get("json")));
	app.use(bodyParser.urlencoded(config.get("urlencoded")));

	config.set("session:store", new MongoStore({
			db: config.get("mongoDb:database")
		})
	);
	app.use(session(config.get("session")));

	app.use(passport.initialize());
	app.use(passport.session());

	require(__dirname + config.get("routes:src")) (app);
	
	try {
		app.listen(config.get("app:port"));
		console.log("App listening on port " + config.get("app:port"));
	} catch(e) {
		console.log(e);
	}

});
