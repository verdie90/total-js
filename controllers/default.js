exports.install = function () {
  ROUTE("GET /");
};

function plain_version() {
  var self = this;
  self.plain("REST Service {0}\nVersion: {1}".format(CONF.name, CONF.version));
}
