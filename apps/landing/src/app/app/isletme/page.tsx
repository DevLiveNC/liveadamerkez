import { requireIsletmePanel } from "./guard";
import { TodayView } from "./today-view";

export default async function IsletmePage() {
  await requireIsletmePanel("/app/isletme");
  return <TodayView />;
}
