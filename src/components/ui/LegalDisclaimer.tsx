import { cn } from "@/lib/utils";

interface LegalDisclaimerProps {
  className?: string;
}

export default function LegalDisclaimer({ className }: LegalDisclaimerProps) {
  return (
    <p
      className={cn(
        "text-xs text-gray-400 text-center leading-relaxed",
        className
      )}
    >
      LexZen ne constitue pas une consultation juridique, un avis juridique
      personnalisé, ni une garantie d&apos;absence de risque.
    </p>
  );
}
