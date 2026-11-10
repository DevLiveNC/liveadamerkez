import { requireIsletmePanel } from "../guard";
import { KayitView } from "./view";

export default async function KayitPage() {
  await requireIsletmePanel("/app/isletme/kayit");
  return <KayitView />;
}
