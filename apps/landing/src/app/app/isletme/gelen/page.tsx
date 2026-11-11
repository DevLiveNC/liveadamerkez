import { requireIsletmePanel } from "../guard";
import { GelenView } from "./view";

export default async function GelenPage() {
  await requireIsletmePanel("/app/isletme/gelen");
  return <GelenView />;
}
