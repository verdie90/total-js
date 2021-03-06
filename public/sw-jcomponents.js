var prefix = "jc";
function hash(s, unsigned) {
  var hash = 0,
    i,
    char;
  if (!s.length) return hash;
  var l = s.length;
  for (i = 0; i < l; i++) {
    char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return unsigned ? hash >>> 0 : hash;
}
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("message", function (e) {
  if (e.data.action === "jc-sw") {
    var data = e.data.data;
    data.name =
      prefix + "-" + data.version + "-" + hash(data.assets.toString(), true);
    addcache(e.data.data);
  }
});
self.addEventListener("fetch", function (e) {
  e.respondWith(
    fetch(e.request).catch(function () {
      return caches.match(e.request).then(function (response) {
        if (response) return response;
        if (
          e.request.mode === "navigate" ||
          (e.request.method === "GET" &&
            e.request.headers.get("accept").includes("text/html"))
        )
          return caches.match("jc-offline-fallback");
      });
    })
  );
});
function addcache(data) {
  caches
    .open(data.name)
    .then(function (cache) {
      if (data.assets && data.assets.length) cache.addAll(data.assets);
      if (data.fallback) {
        fetch(data.fallback, { mode: "no-cors" }).then(function (response) {
          return cache.put("jc-offline-fallback", response);
        });
      }
    })
    .then(function () {
      caches.keys().then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (data.name !== key) return caches.delete(key);
          })
        );
      });
    });
}
