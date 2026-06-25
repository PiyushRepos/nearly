import LegalDocument from "@/components/legal/LegalDocument";
import { privacyPolicy } from "@/config/legal";

export default function PrivacyPolicyPage() {
  return <LegalDocument document={privacyPolicy} />;
}
