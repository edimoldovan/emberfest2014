/*jslint browser:true */
/*jslint nomen:true */
/*global Ember, DS, console, ActiveXObject, XMLHttpRequest*/

var App = Ember.Application.create({
	LOG_TRANSITIONS: true
});

App.ArrayTransform = DS.Transform.extend({
	serialize: function(value) {
		"use strict";
		var property;
		if (Ember.typeOf(value) === "array") {
			property = value;
		} else {
			property = Ember.array;
		}
		return property;
	},
	deserialize: function(value) {
		"use strict";
		return value;
	}
});

App.Router.map(function() {
	"use strict";

	this.route("login", {path: "/login"});

	this.resource("inbox", function() {
		this.route("detail", {path: "/:id"});
		this.route("compose", {path: "/compose"});
		this.route("convert", {path: "/convert/:id"});
	});
	this.resource("projects", function() {
		this.route("detail", {path: "/:id"});
	});

});

App.ApplicationSerializer = DS.RESTSerializer.extend({
	primaryKey: "_id"
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
	namespace: "rest"
});

App.User = DS.Model.extend({
	name: DS.attr("string"),
	email: DS.attr("string")
});

App.Thread = DS.Model.extend({
	from: DS.attr("string"),
	subject: DS.attr("string"),
	snippet: DS.attr("string"),
	htmlMessages: DS.attr("array"),
	textMessages: DS.attr("array")
});

App.Message = DS.Model.extend({
	from: DS.attr("string"),
	to: DS.attr("string"),
	body: DS.attr("string"),
	subject: DS.attr("string")
});

App.Project = DS.Model.extend({
	title: DS.attr("string"),
	description: DS.attr("string"),
	messages: DS.attr("array")
});

App.ApplicationController = Ember.Controller.extend();

App.AuthRoute = Ember.Route.extend({
	beforeModel: function() {
		"use strict";
		var appController = this.controllerFor("application"),
			user = appController.get("user");

		if (!user) {
			if (!window.settings.user._id) {
				this.transitionTo("login");
			} else {
				this.store.find("user", window.settings.user._id).then(function(u) {
					if (u) {
						appController.set("user", u);
					} else {
						this.transitionTo("login");
					}
				});
			}
		}
	}
});

App.LoginRoute = Ember.Route.extend({
	beforeModel: function() {
		"use strict";

		if (window.settings.user._id) {
			this.transitionTo("inbox");
		}
	}
});

App.IndexRoute = App.AuthRoute.extend();

App.InboxRoute = App.AuthRoute.extend({
	model: function() {
		"use strict";
		return this.store.find("thread");
	}
});

App.InboxComposeRoute = App.AuthRoute.extend({
	model: function() {
		"use strict";
		return this.store.createRecord("message", {
			to: "edimoldovan@gmail.com",
			from: "himself@eduardmoldovan.com"
		});
	},
	actions: {
		sendMessage: function(message) {
			"use strict";
			message
				.save()
				.then(function() {
					// we fail here due to gmail error
				});
		}
	}
});

App.InboxDetailRoute = App.AuthRoute.extend({
	actions: {
		convertToProject: function(message) {
			"use strict";
			var project = this.store.createRecord("project", {
					title: message.get("subject"),
					description: message.get("htmlMessages").length > 0 ? message.get("htmlMessages")[0] : message.get("textMessages")
				}),
				_self = this;

			project
				.save()
				.then(function() {
					_self.transitionTo("projects.detail", project);
				});
		}
	}
});

App.ProjectsIndexRoute = App.AuthRoute.extend();

App.ProjectsRoute = App.AuthRoute.extend({
	model: function() {
		"use strict";
		return this.store.find("project");
	}
});

App.ProjectsDetailRoute = App.AuthRoute.extend({
	model: function(parameters) {
		"use strict";
		return this.store.find("project", parameters.id);
	},
	actions: {
		save: function(project) {
			"use strict";
			project.save();
		},
		delete: function(project) {
			"use strict";
			project.destroyRecord();
			this.transitionTo("projects");
		}
	}
});

App.InboxConvertRoute = App.AuthRoute.extend();


// from Kasper Tidemann: http://www.kaspertidemann.com/handling-contenteditable-in-ember-js-via-ember-contenteditableview/
App.ContenteditableView = Ember.View.extend({
	tagName: "div",
	attributeBindings: ["contenteditable"],

	// Variables:
	editable: false,
	isUserTyping: false,
	plaintext: false,

	// Properties:
	contenteditable: (function() {
		"use strict";
		var editable = this.get("editable");

		return editable ? "true" : undefined;
	}).property("editable"),
	
	// Processors:
    	processValue: function() {
    		"use strict";
    		if (!this.get("isUserTyping") && this.get("value")) {
    			return this.setContent();
    		}
    	},

	// Observers:
	alueObserver: (function() {
		"use strict";
    	Ember.run.once(this, "processValue");
    }).observes("value", "isUserTyping"),

	// Events:
	didInsertElement: function() {
		"use strict";
		return this.setContent();
	},

	focusOut: function() {
		"use strict";
		return this.set("isUserTyping", false);
	},

	keyDown: function(event) {
		"use strict";
		if (!event.metaKey) {
			return this.set("isUserTyping", true);
		}
	},

	keyUp: function(event) {
		"use strict";
		if (this.get("plaintext")) {
			return this.set("value", this.$().text());
		} else {
			return this.set("value", this.$().html());
		}
	},

	//render our own html so there are no metamorphs to get screwed up when the user changes the html
	render: function(buffer) {
		"use strict";
		buffer.push(this.get("value"));
	},

	setContent: function() {
		"use strict";
		return this.$().html(this.get("value"));
	}
});

/*document.execCommand( "bold", false );
document.execCommand( "italic", false );*/















