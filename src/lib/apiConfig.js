// تحديد عنوان API بناءً على بيئة التشغيل
const isDevelopment = import.meta.env.DEV;

// استخدام متغير البيئة إذا كان متاحًا، وإلا استخدام القيمة الافتراضية
let API_BASE_URL = import.meta.env.VITE_EMAIL_SERVER_URL || (isDevelopment ? 'http://localhost:3001/api' : '/api');

// التأكد من أن عنوان API لا ينتهي بشرطة مائلة
if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

// التأكد من أن عنوان API لا يحتوي على /api مرتين
if (API_BASE_URL.endsWith('/api/api')) {
  API_BASE_URL = API_BASE_URL.replace('/api/api', '/api');
}

// طباعة معلومات التكوين للتشخيص
console.log('API Configuration:');
console.log('- Environment:', isDevelopment ? 'Development' : 'Production');
console.log('- API Base URL:', API_BASE_URL);
console.log('- VITE_EMAIL_SERVER_URL:', import.meta.env.VITE_EMAIL_SERVER_URL || 'Not set');

export const API_ENDPOINTS = {
  SEND_EMAIL: `${API_BASE_URL}/send-email`,
  TEST_SMTP: `${API_BASE_URL}/test-smtp`
};

export default API_ENDPOINTS;
