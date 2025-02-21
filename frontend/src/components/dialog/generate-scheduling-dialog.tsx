import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useGenerateSchedulingDialogStore from "@/store/use-generate-scheduling-dialog-store";
import GenerateSchedulingForm from "@/components/form/generate-scheduling-form";

export default function GenerateSchedulingDialog() {
  const { open, setOpen } = useGenerateSchedulingDialogStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>生成排班</DialogTitle>
          <DialogDescription>使用遗传算法来自动生成排班</DialogDescription>
        </DialogHeader>
        <GenerateSchedulingForm />
      </DialogContent>
    </Dialog>
  );
}
