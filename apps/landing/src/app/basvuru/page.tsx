import { businessApply } from "@ada-merkez/copy";
import { BusinessApplyForm } from "../../components/BusinessApplyForm";

export const metadata = {
  title: `${businessApply.title} — Ada Merkez`,
  description: businessApply.intro,
};

export default function ApplyPage() {
  return (
    <main id="icerik" className="form-hero">
      <BusinessApplyForm />
    </main>
  );
}
