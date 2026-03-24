// Firebase Messaging Service Worker
// influence-radar 전용 백그라운드 푸시 알림 엔진

// 1. Firebase SDK 가져오기 (Compat 버전 사용으로 안정성 확보)
importScripts('https://www.gstatic.com/firebasejs/11.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.5.0/firebase-messaging-compat.js');

// 2. Firebase 앱 초기화 (사용자님의 프로젝트 설정값)
firebase.initializeApp({
  apiKey: "AIzaSyAl9w26mpnGSTHe-lHBtRFWkIv3tRbA0p8",
  authDomain: "influence-radar-43a48.firebaseapp.com",
  projectId: "influence-radar-43a48",
  storageBucket: "influence-radar-43a48.firebasestorage.app",
  messagingSenderId: "1008784285984",
  appId: "1:1008784285984:web:788217edf21b10eb6e3745",
});

const messaging = firebase.messaging();

// 3. 백그라운드 메시지 수신 핸들러
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 백그라운드 메시지 수신:', payload);

  const { title, body } = payload.notification || {};
  const score = payload.data?.score || 0;

  // 기회 점수에 따른 이모지 및 라벨 설정
  const emoji = score >= 70 ? '🔴' : score >= 45 ? '🟠' : score >= 25 ? '🟡' : '📡';
  const label = score >= 70 ? '즉시포착' : score >= 45 ? '유망 시그널' : score >= 25 ? '관찰' : '뉴스';

  const notificationTitle = `${emoji} ${label} — ${title || 'Influence Radar'}`;
  const notificationOptions = {
    body: body || '새로운 경제 시그널이 감지되었습니다.',
    // GitHub Pages 환경을 고려하여 절대 경로 대신 Firebase 기본 로고 사용 (에러 방지)
    icon: 'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png',
    badge: 'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png',
    tag: `signal-${score}`,
    requireInteraction: score >= 70, // 중요 알림은 사용자가 닫을 때까지 유지
    vibrate: score >= 70 ? [200, 100, 200, 100, 200] : [100],
    data: { 
      url: './influence-radar.html', // 클릭 시 이동할 상대 경로
      score: score 
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. 알림 클릭 시 앱 실행 또는 포커스
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려있는 페이지가 있다면 해당 탭으로 이동
      for (const client of clientList) {
        if (client.url.includes('influence-radar') && 'focus' in client) {
          return client.focus();
        }
      }
      // 열려있는 페이지가 없다면 새로 열기
      if (clients.openWindow) {
        return clients.openWindow('./influence-radar.html');
      }
    })
  );
});