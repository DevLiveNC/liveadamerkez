import { app } from "@ada-merkez/copy";

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string | Date;
  payload?: { suggestedStartsAt?: string; businessName?: string } | null;
};

export function NotificationList({ items }: { items: NotificationRow[] }) {
  return (
    <section className="am-notify" id="bildirimler">
      <h2 className="am-sec-title">{app.notifyTitle}</h2>
      {items.length === 0 ? (
        <p className="am-subtle">{app.notifyEmptyBody}</p>
      ) : (
        <ul className="am-notify-list">
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
