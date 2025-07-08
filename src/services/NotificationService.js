class NotificationService {
  constructor() {
    this.permission = 'default';
    this.registration = null;
    this.initialize();
  }

  async initialize() {
    // Verificar suporte a notificações
    if (!('Notification' in window)) {
      console.warn('Este browser não suporta notificações');
      return;
    }

    // Verificar suporte a service worker
    if (!('serviceWorker' in navigator)) {
      console.warn('Este browser não suporta service workers');
      return;
    }

    // Obter permissão atual
    this.permission = Notification.permission;

    // Registrar service worker se ainda não estiver registrado
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }

  async requestPermission() {
    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  }

  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Permissão de notificação negada');
        return;
      }
    }

    const defaultOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false
    };

    const notificationOptions = { ...defaultOptions, ...options };

    if (this.registration) {
      // Usar service worker para notificações
      return this.registration.showNotification(title, notificationOptions);
    } else {
      // Fallback para notificações básicas
      return new Notification(title, notificationOptions);
    }
  }

  // Notificações específicas do Learnhub
  async notifyHabitReminder(habitName) {
    return this.showNotification('Lembrete de Hábito', {
      body: `Hora de praticar: ${habitName}`,
      tag: 'habit-reminder',
      actions: [
        {
          action: 'complete',
          title: 'Marcar como Concluído'
        },
        {
          action: 'snooze',
          title: 'Lembrar em 1h'
        }
      ],
      data: { type: 'habit', habitName }
    });
  }

  async notifyStudyTime(subject) {
    return this.showNotification('Hora de Estudar', {
      body: `Sessão de estudo: ${subject}`,
      tag: 'study-reminder',
      actions: [
        {
          action: 'start',
          title: 'Iniciar Estudo'
        },
        {
          action: 'postpone',
          title: 'Adiar 30min'
        }
      ],
      data: { type: 'study', subject }
    });
  }

  async notifyTaskDeadline(taskName, deadline) {
    return this.showNotification('Prazo se Aproximando', {
      body: `${taskName} - Prazo: ${deadline}`,
      tag: 'task-deadline',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Ver Tarefa'
        },
        {
          action: 'extend',
          title: 'Estender Prazo'
        }
      ],
      data: { type: 'deadline', taskName, deadline }
    });
  }

  async notifyAchievement(achievementName) {
    return this.showNotification('Conquista Desbloqueada! 🎉', {
      body: `Parabéns! Você conquistou: ${achievementName}`,
      tag: 'achievement',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      actions: [
        {
          action: 'share',
          title: 'Compartilhar'
        },
        {
          action: 'view',
          title: 'Ver Conquistas'
        }
      ],
      data: { type: 'achievement', achievementName }
    });
  }

  // Programar notificações recorrentes
  scheduleHabitReminders(habits) {
    habits.forEach(habit => {
      if (habit.reminderTime && habit.isActive) {
        this.scheduleNotification(
          habit.reminderTime,
          'Lembrete de Hábito',
          `Hora de praticar: ${habit.nome}`,
          { type: 'habit', habitId: habit.id }
        );
      }
    });
  }

  scheduleNotification(time, title, body, data) {
    // Calcular próximo horário de notificação
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Se o horário já passou hoje, agendar para amanhã
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification(title, { body, data });
      // Reagendar para o próximo dia
      this.scheduleNotification(time, title, body, data);
    }, timeUntilNotification);
  }

  // Verificar e instalar updates
  async checkForUpdates() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      
      if (this.registration.waiting) {
        this.showNotification('Atualização Disponível', {
          body: 'Uma nova versão do Learnhub está disponível!',
          tag: 'app-update',
          requireInteraction: true,
          actions: [
            {
              action: 'update',
              title: 'Atualizar Agora'
            },
            {
              action: 'later',
              title: 'Mais Tarde'
            }
          ],
          data: { type: 'update' }
        });
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  }

  // Gerenciar instalação PWA
  async handleInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      
      this.showNotification('Instalar Learnhub', {
        body: 'Instale o Learnhub como um app no seu dispositivo!',
        tag: 'install-prompt',
        requireInteraction: true,
        actions: [
          {
            action: 'install',
            title: 'Instalar'
          },
          {
            action: 'dismiss',
            title: 'Não, obrigado'
          }
        ],
        data: { type: 'install', deferredPrompt: e }
      });
    });
  }
}

export default new NotificationService();
