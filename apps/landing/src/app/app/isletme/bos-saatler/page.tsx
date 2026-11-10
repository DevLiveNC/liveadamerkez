import { requireIsletmePanel } from "../guard";
import { BosSaatlerView } from "./view";

export default async function BosSaatlerPage() {
  await requireIsletmePanel("/app/isletme/bos-saatler");
  return <BosSaatlerView />;
}
