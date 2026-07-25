// Service Worker de Artemisa Belleza
// Estrategia: la app (HTML/íconos) se guarda para abrir sin internet.
// Las llamadas al Sheet y al chat SIEMPRE van a la red (datos frescos).
const CACHE = 'artemisa-v40';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/icon-180.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // Nunca cachear: datos del Sheet, chat, API de Google/Anthropic
  if(url.indexOf('script.google.com')>-1 || url.indexOf('/api/')>-1 || url.indexOf('anthropic')>-1){
    return; // deja que vaya directo a la red
  }
  // Para lo demás: primero red, si falla usa lo guardado (permite abrir sin internet)
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res && res.status===200 && e.request.method==='GET'){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    }).catch(function(){ return caches.match(e.request).then(function(r){ return r || caches.match('/index.html'); }); })
  );
});
