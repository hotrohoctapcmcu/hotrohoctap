(function () {
    'use strict';

    // Expose minimal API under edu.fcm
    if (!window.edu) window.edu = {};
    if (!window.edu.fcm) window.edu.fcm = {};

    var FIREBASE_CONFIG = {
        apiKey: 'AIzaSyA2A_tudRnQTcrfr9zaxvXxmVAlRy9HVUc',
        authDomain: 'iu-notification-7cf54.firebaseapp.com',
        projectId: 'iu-notification-7cf54',
        storageBucket: 'iu-notification-7cf54.firebasestorage.app',
        messagingSenderId: '716994724011',
        appId: '1:716994724011:web:4462bd887a65d2491ab7ee'
    };

    var INBOX_KEY = 'FCM_NOTI_INBOX';
    var UNREAD_KEY = 'FCM_NOTI_UNREAD';
    var INBOX_MAX = 20;

    var BASE_TITLE = '';
    try { BASE_TITLE = document.title || ''; } catch (eT0) { BASE_TITLE = ''; }

    function updateTabTitle(unread) {
        try {
            var n = unread || 0;
            if (!BASE_TITLE) BASE_TITLE = document.title || '';
            if (n > 0) {
                document.title = '(' + (n > 99 ? '99+' : n) + ') ' + BASE_TITLE;
            } else {
                document.title = BASE_TITLE;
            }
        } catch (eT) {
        }
    }

    function safeParseJson(str, fallback) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return fallback;
        }
    }

    function loadInbox() {
        try {
            var raw = localStorage.getItem(INBOX_KEY) || '[]';
            var arr = safeParseJson(raw, []);
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function saveInbox(items) {
        try {
            localStorage.setItem(INBOX_KEY, JSON.stringify(items || []));
        } catch (e) {
        }
    }

    function getUnread() {
        try {
            var raw = localStorage.getItem(UNREAD_KEY);
            var n = raw ? parseInt(raw, 10) : 0;
            return isNaN(n) ? 0 : n;
        } catch (e) {
            return 0;
        }
    }

    function setUnread(n) {
        try {
            localStorage.setItem(UNREAD_KEY, String(n || 0));
        } catch (e) {
        }

        updateTabTitle(n || 0);
    }

    function extractNoti(payload) {
        payload = payload || {};
        var title = '';
        var body = '';

        if (payload.notification) {
            title = payload.notification.title || '';
            body = payload.notification.body || '';
        }
        if (!title && payload.data && payload.data.title) title = payload.data.title;
        if (!body && payload.data && payload.data.body) body = payload.data.body;

        return {
            id: payload.messageId || (String(Date.now()) + '-' + Math.floor(Math.random() * 100000)),
            title: title || 'Thông báo',
            body: body || '',
            receivedAt: Date.now(),
            raw: payload
        };
    }

    function formatRelativeTime(ts) {
        try {
            var now = Date.now();
            var diff = Math.max(0, now - (ts || now));
            var sec = Math.floor(diff / 1000);
            if (sec < 60) return 'Vừa xong';
            var min = Math.floor(sec / 60);
            if (min < 60) return min + ' phút trước';
            var hr = Math.floor(min / 60);
            if (hr < 24) return hr + ' giờ trước';
            var day = Math.floor(hr / 24);
            if (day === 1) return 'Hôm qua';
            if (day < 7) return day + ' ngày trước';
            var d = new Date(ts);
            var dd = String(d.getDate()).padStart(2, '0');
            var mm = String(d.getMonth() + 1).padStart(2, '0');
            var yyyy = d.getFullYear();
            return dd + '/' + mm + '/' + yyyy;
        } catch (e) {
            return '';
        }
    }

    function renderHeaderInbox() {
        var badge = document.getElementById('fcm-noti-badge');
        var menu = document.getElementById('fcm-noti-menu');

        if (!badge || !menu) return;

        var unread = getUnread();
        updateTabTitle(unread);
        if (unread > 0) {
            badge.style.display = '';
            badge.textContent = unread > 99 ? '99+' : String(unread);
        } else {
            badge.style.display = 'none';
            badge.textContent = '0';
        }

        var inbox = loadInbox();

        while (menu.firstChild) menu.removeChild(menu.firstChild);

        // Header
        var liHeader = document.createElement('li');
        liHeader.className = 'fcm-noti-header';

        var hTitle = document.createElement('h6');
        hTitle.innerHTML = '<i class="fal fa-bell"></i> Thông báo';
        if (inbox.length) {
            var cnt = document.createElement('span');
            cnt.className = 'fcm-noti-count';
            cnt.textContent = inbox.length > 99 ? '99+' : String(inbox.length);
            hTitle.appendChild(cnt);
        }
        liHeader.appendChild(hTitle);

        if (inbox.length) {
            var btnMark = document.createElement('button');
            btnMark.type = 'button';
            btnMark.className = 'fcm-noti-mark-read';
            btnMark.id = 'fcm-noti-mark-read';
            btnMark.innerHTML = '<i class="fal fa-check-double"></i>Đánh dấu đã đọc';
            btnMark.addEventListener('click', function (ev) {
                ev.stopPropagation();
                setUnread(0);
                renderHeaderInbox();
            });
            liHeader.appendChild(btnMark);
        }
        menu.appendChild(liHeader);

        // List wrap
        var liWrap = document.createElement('li');
        liWrap.className = 'fcm-noti-list-wrap';

        if (!inbox.length) {
            var emptyBox = document.createElement('div');
            emptyBox.className = 'fcm-noti-empty';
            emptyBox.id = 'fcm-noti-empty';
            emptyBox.innerHTML =
                '<div class="fcm-noti-empty-icon"><i class="fal fa-bell-slash"></i></div>' +
                '<p>Chưa có thông báo nào</p>' +
                '<span>Các thông báo mới sẽ hiển thị ở đây</span>';
            liWrap.appendChild(emptyBox);
            menu.appendChild(liWrap);
            return;
        }

        var ulList = document.createElement('ul');
        ulList.className = 'fcm-noti-list';

        for (var i = 0; i < inbox.length; i++) {
            var it = inbox[i] || {};
            var li = document.createElement('li');
            li.className = 'fcm-noti-item';

            var iconBox = document.createElement('div');
            iconBox.className = 'fcm-noti-icon';
            iconBox.innerHTML = '<i class="fal fa-bell"></i>';

            var content = document.createElement('div');
            content.className = 'fcm-noti-content';

            var title = document.createElement('p');
            title.className = 'fcm-noti-title';
            title.textContent = it.title || 'Thông báo';
            content.appendChild(title);

            if (it.body) {
                var body = document.createElement('p');
                body.className = 'fcm-noti-text';
                body.textContent = it.body;
                content.appendChild(body);
            }

            var time = document.createElement('span');
            time.className = 'fcm-noti-time';
            time.innerHTML = '<i class="fal fa-clock"></i><span></span>';
            time.lastChild.textContent = formatRelativeTime(it.receivedAt || Date.now());
            content.appendChild(time);

            li.appendChild(iconBox);
            li.appendChild(content);
            ulList.appendChild(li);
        }

        liWrap.appendChild(ulList);
        menu.appendChild(liWrap);
    }

    function pushInboxItem(item) {
        var inbox = loadInbox();
        // prevent duplicates by id
        if (item && item.id) {
            for (var i = 0; i < inbox.length; i++) {
                if (inbox[i] && inbox[i].id === item.id) return;
            }
        }
        inbox.unshift(item);
        if (inbox.length > INBOX_MAX) inbox.length = INBOX_MAX;
        saveInbox(inbox);
    }

    function handleIncoming(payload) {
        var item = extractNoti(payload);
        pushInboxItem(item);
        setUnread(getUnread() + 1);
        renderHeaderInbox();
    }

    function attachHeaderHandlersOnce() {
        if (window.__fcmHeaderBound) return;
        window.__fcmHeaderBound = true;

        var btn = document.getElementById('fcm-noti-button');
        if (btn) {
            btn.addEventListener('click', function () {
                // When user opens the dropdown, mark all as read
                setUnread(0);
                renderHeaderInbox();
            });
        }
    }

    function attachServiceWorkerMessageListenerOnce() {
        if (window.__fcmSwMsgBound) return;
        window.__fcmSwMsgBound = true;

        try {
            if (navigator && navigator.serviceWorker) {
                navigator.serviceWorker.addEventListener('message', function (event) {
                    var data = event && event.data ? event.data : null;
                    if (!data) return;
                    if (data.type === 'FCM_BG_MESSAGE' && data.payload) {
                        handleIncoming(data.payload);
                    }
                });
            }
        } catch (e) {
        }
    }

    // You MUST set this (Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates)
    // E.g. in index.aspx: window.FCM_VAPID_KEY = '...';
    function getVapidKey() {
        var key = (window.FCM_VAPID_KEY || '').trim();
        if (key) return key;
        try {
            key = (localStorage.getItem('FCM_VAPID_KEY') || '').trim();
        } catch (e) {
        }
        return key;
    }

    function isProbablyValidVapidKey(key) {
        // Firebase Web Push public key is base64url and usually ~87 chars.
        // This is a heuristic check to catch common mistakes (server key, private key, too short, contains invalid chars).
        if (!key) return false;
        if (key.length < 70) return false;
        return /^[A-Za-z0-9_-]+$/.test(key);
    }

    function normalizeUrlJoin(base, path) {
        base = base || '';
        path = path || '';
        if (!base) return path;
        if (!path) return base;
        if (base[base.length - 1] === '/' && path[0] === '/') return base + path.substring(1);
        if (base[base.length - 1] !== '/' && path[0] !== '/') return base + '/' + path;
        return base + path;
    }

    function getServiceWorkerUrl() {
        // Prefer edu.system.rootPath (contains virtual directory), fallback to same folder.
        try {
            if (window.edu && edu.system && edu.system.rootPath) {
                return normalizeUrlJoin(edu.system.rootPath, '/firebase-messaging-sw.js');
            }
        } catch (e) {
        }
        return 'firebase-messaging-sw.js';
    }

    function canUseWebPush() {
        if (!('Notification' in window)) return false;
        if (!('serviceWorker' in navigator)) return false;
        if (!('PushManager' in window)) return false;
        if (typeof window.isSecureContext === 'boolean' && window.isSecureContext === false) return false;
        return true;
    }

    function initFirebaseIfNeeded() {
        if (!window.firebase) {
            console.warn('[FCM] firebase SDK not loaded (missing firebase-app-compat / firebase-messaging-compat)');
            return null;
        }

        try {
            if (!firebase.apps || !firebase.apps.length) {
                var webnotu = firebase.initializeApp(FIREBASE_CONFIG);
                console.log('[FCM] Firebase initialized:', webnotu);
            }
        } catch (e) {
            // ignore duplicate init
        }

        try {
            return firebase.messaging();
        } catch (e2) {
            console.warn('[FCM] firebase.messaging() failed:', e2);
            return null;
        }
    }

    function saveTokenToOracle(token) {
        try {
            if (!window.edu || !edu.system || typeof edu.system.makeRequest !== 'function') {
                console.warn('[FCM] edu.system.makeRequest not available');
                return;
            }

            if (!edu.system.userId) {
                console.warn('[FCM] missing edu.system.userId; skip saving token');
                return;
            }

            // 1) Try insert (ThemMoi_USER_FCM)
            var obj_insert = {
                action: 'CMS_ThongBao_MH/FSkkLAwuKB4UEgQTHgcCDAPP',
                func: 'pkg_thongbao.ThemMoi_USER_FCM',
                iM: edu.system.iM,
                strUSER_ID: edu.system.userId,
                strTOKEN: token
            };

            // 2) Fallback update (Update_USER_FCM)
            var obj_update = {
                action: 'CMS_ThongBao_MH/FDElIDUkHhQSBBMeBwIM',
                func: 'pkg_thongbao.Update_USER_FCM',
                iM: edu.system.iM,
                strUSER_ID: edu.system.userId,
                strTOKEN: token
            };

            function doUpdate(reason) {
                edu.system.makeRequest({
                    success: function (data2) {
                        console.log('[FCM] updated token:', data2 && data2.Success !== undefined ? data2.Success : data2, reason ? ('(' + reason + ')') : '');
                    },
                    error: function (er2) {
                        console.warn('[FCM] update token error:', er2);
                    },
                    type: 'POST',
                    action: obj_update.action,
                    contentType: true,
                    data: obj_update
                }, false, false, false, null);
            }

            edu.system.makeRequest({
                success: function (data) {
                    // Expecting { Success, Message, Data } (varies by API)
                    if (data && data.Success === true) {
                        console.log('[FCM] inserted token: true');
                        return;
                    }

                    // Insert failed (often because record exists) => update
                    doUpdate((data && data.Message) ? data.Message : 'insert-not-success');
                },
                error: function (er) {
                    // Insert call errored => try update as a best-effort
                    console.warn('[FCM] insert token error:', er);
                    // Don't spam update on auth errors
                    if (er && er.status === 401) return;
                    doUpdate('insert-error');
                },
                type: 'POST',
                action: obj_insert.action,
                contentType: true,
                data: obj_insert
            }, false, false, false, null);
        } catch (e) {
            console.warn('[FCM] saveTokenToOracle exception:', e);
        }
    }

    async function registerServiceWorker() {
        var swUrl = getServiceWorkerUrl();
        try {
            return await navigator.serviceWorker.register(swUrl);
        } catch (e) {
            console.warn('[FCM] service worker register failed:', swUrl, e);
            return null;
        }
    }

    async function getAndSaveToken(messaging, serviceWorkerRegistration) {
        var vapidKey = getVapidKey();
        if (!vapidKey) {
            console.warn('[FCM] Missing window.FCM_VAPID_KEY (VAPID key)');
            return;
        }

        if (!isProbablyValidVapidKey(vapidKey)) {
            console.warn('[FCM] VAPID key looks invalid (len=' + vapidKey.length + '). Use Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates -> Public key.');
            return;
        }

        try {
            var currentToken = await messaging.getToken({
                vapidKey: vapidKey,
                serviceWorkerRegistration: serviceWorkerRegistration || undefined
            });

            if (!currentToken) {
                console.warn('[FCM] No token returned');
                return;
            }

            // Expose token for debugging/copying
            try {
                if (window.edu && edu.fcm) edu.fcm.currentToken = currentToken;
            } catch (eExpose) {
            }
            try {
                localStorage.setItem('FCM_CURRENT_TOKEN', currentToken);
            } catch (eLs) {
            }
            console.log('[FCM] Token đang sử dụng là:', currentToken);
            var cacheKey = 'FCM_TOKEN_LAST';
            var lastToken = '';
            try { lastToken = localStorage.getItem(cacheKey) || ''; } catch (e0) { }

            if (lastToken !== currentToken) {
                try { localStorage.setItem(cacheKey, currentToken); } catch (e1) { }
                saveTokenToOracle(currentToken);
            } else {
                // unchanged
            }
        } catch (e2) {
            console.warn('[FCM] getToken failed:', e2);
        }
    }

    async function enableNotificationsInternal() {
        if (!canUseWebPush()) {
            console.warn('[FCM] Web Push requires HTTPS (or localhost) + Notifications + ServiceWorker + PushManager');
            return;
        }

        attachHeaderHandlersOnce();
        attachServiceWorkerMessageListenerOnce();
        try { renderHeaderInbox(); } catch (eRender0) { }

        // Request permission only when needed
        if (Notification.permission === 'denied') {
            console.warn('[FCM] Notification permission denied');
            return;
        }

        if (Notification.permission !== 'granted') {
            try {
                var permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.warn('[FCM] User did not grant permission:', permission);
                    return;
                }
            } catch (e0) {
                console.warn('[FCM] requestPermission failed:', e0);
                return;
            }
        }

        var messaging = initFirebaseIfNeeded();
        if (!messaging) return;

        try {
            if (typeof messaging.onMessage === 'function') {
                messaging.onMessage(function (payload) {
                    try { handleIncoming(payload); } catch (e0) { }
                    console.log('[FCM] foreground message:', payload);
                });
            }
        } catch (eMsg) {
        }

        var reg = await registerServiceWorker();
        await getAndSaveToken(messaging, reg);
    }

    // Public API
    // Call after login has completed and edu.system.userId is ready.
    window.edu.fcm.init = function () {
        // Delay a bit so AFG() finishes and edu.system is fully populated.
        setTimeout(function () {
            enableNotificationsInternal();
        }, 500);
    };

    // Manual trigger if you prefer calling from a button later:
    window.edu.fcm.enable = function () {
        return enableNotificationsInternal();
    };

    // Get last known token (from memory or localStorage)
    window.edu.fcm.getToken = function () {
        try {
            if (window.edu && edu.fcm && edu.fcm.currentToken) return edu.fcm.currentToken;
        } catch (e0) {
        }
        try {
            return localStorage.getItem('FCM_CURRENT_TOKEN') || '';
        } catch (e1) {
        }
        return '';
    };

    // Optional helpers
    window.edu.fcm.getInbox = function () {
        return loadInbox();
    };

    window.edu.fcm.markAllRead = function () {
        setUnread(0);
        renderHeaderInbox();
    };

    // Diagnostics: run in console -> edu.fcm.debug()
    window.edu.fcm.debug = async function () {
        var info = {
            href: '',
            origin: '',
            isSecureContext: null,
            notificationPermission: null,
            vapidLen: 0,
            swSupported: false,
            swController: false,
            swUrl: '',
            swScope: '',
            tokenCached: '',
            unread: 0
        };

        try { info.href = String(location.href || ''); } catch (e0) { }
        try { info.origin = String(location.origin || ''); } catch (e1) { }
        try { info.isSecureContext = (typeof window.isSecureContext === 'boolean') ? window.isSecureContext : null; } catch (e2) { }
        try { info.notificationPermission = (window.Notification && Notification.permission) ? Notification.permission : null; } catch (e3) { }
        try { info.vapidLen = (getVapidKey() || '').length; } catch (e4) { }
        try { info.swSupported = !!(navigator && navigator.serviceWorker); } catch (e5) { }
        try { info.swController = !!(navigator && navigator.serviceWorker && navigator.serviceWorker.controller); } catch (e6) { }
        try { info.swUrl = getServiceWorkerUrl(); } catch (e7) { }
        try { info.tokenCached = window.edu && edu.fcm ? (edu.fcm.getToken ? edu.fcm.getToken() : (edu.fcm.currentToken || '')) : ''; } catch (e8) { }
        try { info.unread = getUnread(); } catch (e9) { }

        console.log('[FCM][debug] info:', info);

        // Try SW register/ready
        var reg = null;
        try {
            reg = await registerServiceWorker();
            if (reg) {
                info.swScope = reg.scope || '';
                console.log('[FCM][debug] sw registration ok:', reg.scope);
            } else {
                console.warn('[FCM][debug] sw registration is null');
            }
        } catch (eReg) {
            console.warn('[FCM][debug] sw registration failed:', eReg);
        }

        // Try getToken (will fail if permission not granted)
        try {
            var messaging = initFirebaseIfNeeded();
            if (!messaging) {
                console.warn('[FCM][debug] firebase.messaging unavailable');
                return info;
            }
            await getAndSaveToken(messaging, reg);
            console.log('[FCM][debug] token after getAndSaveToken:', (window.edu && edu.fcm) ? (edu.fcm.currentToken || edu.fcm.getToken()) : '');
        } catch (eTok) {
            console.warn('[FCM][debug] getToken failed:', eTok);
        }

        return info;
    };
})();
