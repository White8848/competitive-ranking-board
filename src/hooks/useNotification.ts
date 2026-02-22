import { useState, useCallback, useRef } from 'react';
import type { NotificationType } from '../types';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const idRef = useRef(0);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = ++idRef.current;
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, showNotification, removeNotification };
}
