// Firebase 설정 파일
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics' // Analytics 모듈 임포트

// cSpell:disable
const firebaseConfig = {
  apiKey: 'AIzaSyDdAfzQydfo7HhMWW7OQispuYRweORG9kU',
  authDomain: 'n-nest.firebaseapp.com',
  projectId: 'n-nest',
  storageBucket: 'n-nest.appspot.com',
  messagingSenderId: '1092378318533',
  appId: '1:1092378318533:web:3ebb6207aa0f046cb902ac',
  measurementId: 'G-P6CTDD0V1K'
}

const app = initializeApp(firebaseConfig)

// Analytics 초기화를 클라이언트 사이드에서만 수행
let analytics
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

const auth = getAuth(app)

export { auth, app } // 필요에 따라 app도 내보낼 수 있습니다.
