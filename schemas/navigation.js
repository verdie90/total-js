NEWSCHEMA('Navigation', function(schema) {

	schema.define('id', UID);
	schema.define('parentid', UID);
	schema.define('designid', String);
	schema.define('icon', 'String(30)');
	schema.define('color', 'String(7)');
	schema.define('name', String, true);
	schema.define('sortindex', Number);

	schema.setQuery(function($) {
		NOSQL('navigation').find().sort('sortindex').callback($.callback);
	});

	schema.setSave(function($, model) {

		var db;

		if (model.id) {
			model.dtupdated = NOW;
			db = NOSQL('navigation').modify(model).id(model.id);
		} else {
			model.id = UID();
			model.dtcreated = NOW;
			db = NOSQL('navigation').insert(model);
		}

		db.callback($.done(model.id));
	});

	schema.addWorkflow('sortindex', function($) {

		var db = NOSQL('navigation');
		var id = $.query.id.split(',');

		for (var i = 0; i < id.length; i++)
			db.modify({ sortindex: i }).id(id[i]);

		$.success();
	});

	schema.setRemove(function($) {
		NOSQL('navigation').remove().id($.id).callback($.done($.id));
	});

});