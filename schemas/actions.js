var insert = function(doc) {
	doc.dtcreated = NOW;
};

NEWSCHEMA('Actions', function(schema) {

	schema.define('id', String, true);
	schema.define('name', String, true);
	schema.define('note', String);

	schema.setQuery(function($) {
		NOSQL('actions').find().callback($.callback).sort('dtcreated_desc');
	});

	schema.setSave(function($, model) {
		model.dtupdated = NOW;
		NOSQL('actions').modify(model, true).id($.id).callback($.done($.id)).insert(insert);
	});

	schema.setRemove(function($) {
		NOSQL('actions').remove().id($.id).callback($.done($.id));
	});

	schema.addWorkflow('designer', function($) {
		NOSQL('actions').find().callback(function(err, response) {
			NOSQL('designs').find().fields('id,type,name,dtcreated').callback(function(err, designs) {

				for (var i = 0; i < designs.length; i++) {
					var item = designs[i];
					item.id = '@' + item.id;
					item.name = '@' + item.name;
				}

				response.push.apply(response, designs);
				response.quicksort('dtcreated_desc');

				NOSQL('sources').find().where('type', 'crud').fields('id,name,dtcreated').callback(function(err, sources) {

					for (var i = 0; i < sources.length; i++) {
						var item = sources[i];
						item.id = 'source ' + item.id;
						item.name = 'Remove: ' + item.name;
					}

					response.push.apply(response, sources);
					$.callback(response);
				});

			});
		});
	});

});