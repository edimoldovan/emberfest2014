/*jslint browser:true */
/*jslint nomen:true */
/*global module, process,EventEmitter,__dirname,require,$,console,cookie,alert,Ember,jQuery,FileReader,canvas,FB*/

var documents = {},
	mongo = require("mongodb"),
	MongoClient = mongo.MongoClient,
	ObjectID = mongo.ObjectID,
	globalApp;

module.exports = function (app) {
	"use strict";
	globalApp = app;
	return documents;
};

documents.create = function(collection, data, callback) {
	"use strict";
	var collectionObject;

	console.log(data);

	MongoClient.connect(globalApp.config.get("mongoDb:connectString"), function(error, db) {
		if (error) {
			throw error;
		}

		collectionObject = db.collection(collection);
		collectionObject.insert(data, {}, function(error, results) {
			if (error) {
				throw error;
			}
			callback(results[0]);
			db.close();
		});
	});
};

documents.findOne = function(collection, id, callback) {
	"use strict";
	var collectionObject;

	MongoClient.connect(globalApp.config.get("mongoDb:connectString"), function(error, db) {
		var mongoId = new ObjectID(id);
		if (error) {
			throw error;
		}

		collectionObject = db.collection(collection);
		collectionObject
			.findOne({_id: mongoId}, function(error, results) {
				callback(results);
				db.close();
			});
	});
};

documents.findAllByDistance = function(collection, query, limit, callback) {
	"use strict";

	// console.log(query);

	MongoClient.connect(globalApp.config.get("mongoDb:connectString"), function(error, db) {
		if (error) {
			throw error;
		}

		db.executeDbCommand(
			{
				geoNear: collection,
				near: [
					parseFloat(query.lon),
					parseFloat(query.lat)
				],
				maxDistance: 0.002//100 / 111.12
			}, function(error, result) {
				if (error) {
					throw error;
				}

				if (result.documents) {
					callback(result);
					db.close();
				}
				
			}
		);
	});
};

documents.findAll = function(collection, query, limit, callback) {
	"use strict";
	var collectionObject;

	// console.log(query);

	MongoClient.connect(globalApp.config.get("mongoDb:connectString"), function(error, db) {
		if (error) {
			throw error;
		}

		collectionObject = db.collection(collection);
		collectionObject
			.find(query)
			.toArray(function(err, results) {
				callback(results);
				db.close();
		});
	});
};

documents.update = function(collection, id, data, callback) {
	"use strict";
	var collectionObject,
		mongoId = new ObjectID(id);

	// console.log(data);

	MongoClient.connect(globalApp.config.get("mongoDb:connectString"), function(error, db) {
		if (error) {
			throw error;
		}

		collectionObject = db.collection(collection);
		collectionObject.update({_id: mongoId}, {$set: data}, {}, function(error, results) {
			if (error) {
				throw error;
			}
			callback(results);
			db.close();
		});
	});
};

documents.upsert = function(collection, criteria, data, callback) {
	"use strict";
	var collectionObject;

	// console.log(data);

	MongoClient.connect(globalApp.config.get("mongoDb:connectString"), function(error, db) {
		if (error) {
			throw error;
		}

		collectionObject = db.collection(collection);
		collectionObject.update(criteria, {$set: data}, {upsert: true}, function(error, results) {
			if (error) {
				throw error;
			}
			callback(results);
			db.close();
		});
	});
};

documents.delete = function(collection, id, callback) {
	"use strict";
	var collectionObject,
		mongoId = new ObjectID(id);

	MongoClient.connect(globalApp.config.get("mongoDb:connectString"), function(error, db) {
		if (error) {
			throw error;
		}

		collectionObject = db.collection(collection);
		collectionObject.findAndModify({_id: mongoId}, {}, {}, {remove: true}, function(error, results) {
			if (error) {
				throw error;
			}
			callback(results);
			db.close();
		});
	});
};












