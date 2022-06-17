NEWSCHEMA('Sources/Properties', function(schema) {
	schema.define('type', String, true);
	schema.define('def', Object);
	schema.define('path', String, true);
	schema.define('name', String, true);
});

NEWSCHEMA('Sources/URL', function(schema) {
	schema.define('query', String);
	schema.define('read', String);
	schema.define('list', String);
	schema.define('create', String);
	schema.define('delete', String);
	schema.define('update', String);
	schema.define('search', String);
	schema.define('upload', String);
});

var insert = function(doc) {
	doc.dtcreated = NOW;
};

NEWSCHEMA('Sources', function(schema) {

	schema.define('id', 'String(30)', true);
	schema.define('type', ['crud', 'list', 'cl', 'detail', 'query', 'upload'], true);
	schema.define('name', String, true);
	schema.define('icon', 'String(30)');
	schema.define('properties', '[Sources/Properties]');
	schema.define('url', 'Sources/URL');
	schema.define('static', Boolean);
	schema.define('local', Boolean);

	schema.setQuery(function($) {
		NOSQL('sources').find().callback($.callback);
	});

	schema.setSave(function($, model) {
		model.dtupdated = NOW;
		NOSQL('sources').modify(model, true).id(model.id).callback($.done(model.id)).insert(insert);
	});

	schema.setRemove(function($) {
		NOSQL('sources').remove().id($.id).callback($.done($.id));
	});

});