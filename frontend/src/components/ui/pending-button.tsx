import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function PendingButton() {
  return (
    <Button disabled>
      <Loader2 className="animate-spin" />
      请稍等
    </Button>
  );
}
