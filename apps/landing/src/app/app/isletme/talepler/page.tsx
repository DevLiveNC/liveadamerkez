import { requireIsletmePanel } from "../guard";
import { TaleplerView } from "./view";

export default async function TaleplerPage() {
  await requireIsletmePanel("/app/isletme/talepler");
  return <TaleplerView />;
}
