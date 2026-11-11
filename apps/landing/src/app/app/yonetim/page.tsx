import { requireYonetimPanel } from "./guard";
import { OnaylarView } from "./onaylar-view";

export const dynamic = "force-dynamic";

export default async function YonetimPage() {
  await requireYonetimPanel("/app/yonetim");
  return <OnaylarView />;
}
