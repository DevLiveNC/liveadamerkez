import { requireIsletmePanel } from "./guard";
import { GenelView } from "./genel-view";

export default async function IsletmePage() {
  await requireIsletmePanel("/app/isletme");
  return <GenelView />;
}
