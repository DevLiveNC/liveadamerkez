import { requireYonetimPanel } from "./guard";
import { GenelView } from "./genel-view";

export const dynamic = "force-dynamic";

export default async function YonetimPage() {
  await requireYonetimPanel("/app/yonetim");
  return <GenelView />;
}
