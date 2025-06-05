import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAvyCzmEiPVbVasWgsUVOnDZzCfJoZq4CI",
  authDomain: "learnhub-d18a1.firebaseapp.com",
  projectId: "learnhub-d18a1",
  storageBucket: "learnhub-d18a1.firebasestorage.app",
  messagingSenderId: "791816992157",
  appId: "1:791816992157:web:6c453f59543d78377d2b74",
  measurementId: "G-3H3M2VCCCL"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: "SUA_VAPID_KEY" });
    if (token) {
      console.log('Token de notificação:', token);
      // Salve o token no backend ou use-o para enviar notificações
    } else {
      console.log('Permissão para notificações não concedida.');
    }
  } catch (error) {
    console.error('Erro ao obter o token de notificação:', error);
  }
};

export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};