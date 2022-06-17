exports.install = function () {
  CORS();
  // Sources
  ROUTE("GET       /api/sources/            *Sources      --> @query");
  ROUTE("POST      /api/sources/            *Sources      --> @save");
  ROUTE("DELETE    /api/sources/{id}/       *Sources      --> @remove");

  // Designs
  ROUTE("GET       /api/designs/            *Designs      --> @query");
  ROUTE("GET       /api/designs/{id}/       *Designs      --> @read");
  ROUTE("POST      /api/designs/            *Designs      --> @save");
  ROUTE("DELETE    /api/designs/{id}/       *Designs      --> @remove");

  // Actions
  ROUTE("GET       /api/actions/            *Actions      --> @query");
  ROUTE("DELETE    /api/actions/{id}/       *Actions      --> @remove");
  ROUTE("GET       /api/actions/designer/   *Actions      --> @designer");

  // Navigation
  ROUTE("GET       /api/navigation/         *Navigation   --> @query");
  ROUTE("POST      /api/navigation/         *Navigation   --> @save");
  ROUTE("DELETE    /api/navigation/{id}/    *Navigation   --> @remove");
  ROUTE("GET       /api/navigation/sort/    *Navigation   --> @sortindex");

  // User
  ROUTE("GET    /api/users/        *Users --> query");
  ROUTE("GET    /api/users/{id}/   *Users --> read");
  ROUTE("POST   /api/users/        *Users --> insert");
  ROUTE("PUT    /api/users/{id}/   *Users --> update");
  ROUTE("DELETE /api/users/{id}/   *Users --> remove");
};
