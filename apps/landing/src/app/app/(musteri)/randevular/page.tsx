import { app } from "@ada-merkez/copy";
import { AppointmentBoard, type AppointmentRow } from "../../../../components/app/AppointmentBoard";
import { EmptyState } from "../../../../components/app/EmptyState";
import { NotificationList, type NotificationRow } from "../../../../components/app/NotificationList";
import { requireRole } from "../../../../lib/app-auth";
import { serverApi } from "../../../../lib/app-api";

export default async function RandevularPage() {
  await requireRole("customer", "/app/randevular");
  const [data, notes] = await Promise.all([
    serverApi<{ ok?: boolean; bookings?: AppointmentRow[] }>("/v1/me/bookings"),
    serverApi<{ ok?: boolean; notifications?: NotificationRow[] }>("/v1/me/notifications"),
  ]);
  const bookings = data?.ok ? (data.bookings ?? []) : [];
  const notifications = notes?.ok ? (notes.notifications ?? []) : [];
  const now = Date.now();
  const upcoming = bookings.filter((row) => {
    const start = new Date(row.startsAt).getTime();
    return (row.status === "pending" || row.status === "confirmed") && start >= now;
  });
  const past = bookings.filter((row) => !upcoming.some((item) => item.id === row.id));

  return (
    <>
      <header className="am-header am-header--blur">
        <h1 className="am-header-title">{app.bookingsTitle}</h1>
      </header>
      <NotificationList items={notifications} />
      <AppointmentBoard
        upcoming={upcoming}
        past={past}
        empty={<EmptyState kind="rezervasyon-yok" />}
      />
    </>
  );
}
