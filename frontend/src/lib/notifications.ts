export type NotificationType = 'payment' | 'claim';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  policyNumber?: string;
  claimNumber?: string;
}

const STORAGE_KEY = 'app_notifications_list';
const EVENT_NAME = 'app-notifications-updated';

export function getNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as AppNotification[];
  } catch (e) {
    return [];
  }
}

export function addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) {
  if (typeof window === 'undefined') return;
  const current = getNotifications();
  const newNotif: AppNotification = {
    ...notification,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  
  const updated = [newNotif, ...current]; // Prepend so newest is first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function markAllAsRead() {
  if (typeof window === 'undefined') return;
  const current = getNotifications();
  let changed = false;
  const updated = current.map((n) => {
    if (!n.isRead) changed = true;
    return { ...n, isRead: true };
  });
  
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export function subscribeToNotifications(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}
