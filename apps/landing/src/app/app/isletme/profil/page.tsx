import { requireIsletmePanel } from "../guard";
import { ProfilView } from "./view";

export default async function ProfilPage() {
  await requireIsletmePanel("/app/isletme/profil");
  return <ProfilView />;
}
