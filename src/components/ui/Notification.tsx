import type { NotificationType } from '../../types';
import styles from './Notification.module.css';

interface Props {
  notifications: { id: number; message: string; type: NotificationType }[];
}

export function NotificationContainer({ notifications }: Props) {
  return (
    <div className={styles.container}>
      {notifications.map((n) => (
        <div key={n.id} className={`${styles.notification} ${styles[n.type]}`}>
          {n.message}
        </div>
      ))}
    </div>
  );
}
