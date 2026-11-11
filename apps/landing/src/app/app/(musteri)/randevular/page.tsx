import { app } from "@ada-merkez/copy";
import { AppointmentBoard, type AppointmentRow } from "../../../../components/app/AppointmentBoard";
import { EmptyState } from "../../../../components/app/EmptyState";
import { requireRole } from "../../../../lib/app-auth";
import { serverApi } from "../../../../lib/app-api";

export default async function RandevularPage() {
  await requireRole("customer", "/app/randevular");
  const data = await serverApi<{ ok?: boolean; bookings?: AppointmentRow[] }>("/v1/me/bookings");
  const bookings = data?.ok ? (data.bookings ?? []) : [];
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
      <AppointmentBoard
        upcoming={upcoming}
        past={past}
        empty={<EmptyState kind="rezervasyon-yok" />}
      />
    </>
  );
}
