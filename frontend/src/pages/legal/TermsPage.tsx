import LegalDocument from "@/components/legal/LegalDocument";
import { termsOfService } from "@/config/legal";

export default function TermsPage() {
  return <LegalDocument document={termsOfService} />;
}
