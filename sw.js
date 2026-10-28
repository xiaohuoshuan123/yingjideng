/**
 * yingjideng Service Worker - PWA 离线缓存
 * 缓存策略: Cache First, Network Fallback
 */

const CACHE_NAME = 'yingjideng-v5';
const OFFLINE_PAGE = '/index.html';

// 需要缓存的资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/category.html',
    '/favorites.html',
    '/tool.html',
    '/css/style.css?v=5',
    '/css/ai-badges.css?v=5',
    '/css/favorites.css?v=5',
    '/js/app.js?v=5',
    '/js/favorites.js?v=5',
    '/data/tools.json',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.4/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.bundle.min.js',
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] 缓存静态资源');
            return cache.addAll(STATIC_ASSETS);
        }).catch((err) => {
            console.error('[SW] 缓存失败:', err);
        })
    );
    self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 拦截请求 - 缓存优先策略
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过非 GET 请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过 CORS 跨域请求（除了 CDN 静态资源）
    if (url.origin !== self.location.origin && !url.hostname.includes('jsdelivr.net')) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // 返回缓存，同时后台更新
                const fetchPromise = fetch(request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // 网络失败，返回缓存
                    return cachedResponse;
                });

                // 对于导航请求，优先返回缓存
                if (request.mode === 'navigate') {
                    return cachedResponse;
                }

                return fetchPromise;
            }

            // 没有缓存，尝试网络请求
            return fetch(request).then((networkResponse) => {
                if (networkResponse.ok) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // 网络失败，返回离线页面
                if (request.mode === 'navigate') {
                    return caches.match(OFFLINE_PAGE);
                }
                return new Response('离线模式，无法加载资源', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            });
        })
    );
});

// 后台消息 - 支持主动更新缓存
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});