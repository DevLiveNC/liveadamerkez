import { requireYonetimPanel } from "../guard";
import { RaporlarView } from "./view";

export const dynamic = "force-dynamic";

export default async function RaporlarPage() {
  await requireYonetimPanel("/app/yonetim/raporlar");
  return <RaporlarView />;
}
