NEWSCHEMA('Designs', function(schema) {

	schema.define('id', UID);
	schema.define('parentid', UID);
	schema.define('type', ['form', 'view', 'largeform'], true);
	schema.define('name', String, true);
	schema.define('design', String);
	schema.define('settings', Object);
	schema.define('sourceid', String);

	schema.setQuery(function($) {
		NOSQL('designs').find().fields('id,name,parentid,type,dtcreated').sort('dtcreated_desc').callback($.callback);
	});

	schema.setRead(function($) {
		NOSQL('designs').one().id($.id).callback($.callback, '404');
	});

	schema.setSave(function($, model) {

		var db;

		if (model.id) {
			model.dtupdated = NOW;
			db = NOSQL('designs').modify(model).id(model.id);
		} else {
			model.id = UID();
			model.dtcreated = NOW;
			db = NOSQL('designs').insert(model);
		}

		db.callback($.done(model.id));

	});

	schema.setRemove(function($) {
		NOSQL('designs').remove().id($.id).callback($.done($.id));
	});

});