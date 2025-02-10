import { NumberInput } from "@/components/number-input";
import { TimePicker } from "@/components/time-picker/time-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isAfter, isBefore, isEqual, parse } from "date-fns";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const schema = z
  .object({
    startTime: z
      .string()
      .time({ precision: 0, message: "请输入正确的开始时间" }),
    endTime: z.string().time({ precision: 0, message: "请输入正确的结束时间" }),
    requiredAssistantNumber: z.number().min(1, "助理人数不能小于 1"),
  })
  .refine(
    (data) => {
      const date = new Date();
      const startTime = parse(data.startTime, "HH:mm:ss", date);
      const endTime = parse(data.endTime, "HH:mm:ss", date);
      return isBefore(startTime, endTime);
    },
    {
      message: "结束时间必须要大于开始时间",
      path: ["endTime"],
    }
  );

export default function AddShiftDialog({ open, onOpenChange }: Props) {
  const parentForm = useFormContext();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      startTime: "00:00:00",
      endTime: "00:00:00",
      requiredAssistantNumber: 1,
    },
  });

  const date = new Date();

  const onSubmit = (data: z.infer<typeof schema>) => {
    const oldShifts = parentForm.getValues("shifts");
    const newShiftStartTime = parse(data.startTime, "HH:mm:ss", date);
    const newShiftEndTime = parse(data.endTime, "HH:mm:ss", date);

    // 检查是否有冲突的时间段
    const hasConflict = oldShifts.some(
      (shift: {
        startTime: string;
        endTime: string;
        requiredAssistantNumber: number;
        applicableDays: number[];
      }) => {
        const shiftStartTime = parse(shift.startTime, "HH:mm:ss", date);
        const shiftEndTime = parse(shift.endTime, "HH:mm:ss", date);

        return !(
          isAfter(shiftStartTime, newShiftEndTime) ||
          isEqual(shiftStartTime, newShiftEndTime) ||
          isAfter(newShiftStartTime, shiftEndTime) ||
          isEqual(newShiftStartTime, shiftEndTime)
        );
      }
    );

    if (hasConflict) {
      form.setError("endTime", { message: "与已有班次时间冲突" });
      return;
    }

    parentForm.setValue("shifts", [
      ...oldShifts,
      { ...data, applicableDays: [] },
    ]);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加班次</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <Label>开始时间</Label>
                    <TimePicker
                      date={parse(field.value, "HH:mm:ss", date)}
                      setDate={(date) => {
                        field.onChange(format(date || new Date(), "HH:mm:ss"));
                      }}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="ml-auto">
                    <Label>结束时间</Label>
                    <TimePicker
                      date={parse(field.value, "HH:mm:ss", date)}
                      setDate={(date) => {
                        field.onChange(format(date || new Date(), "HH:mm:ss"));
                      }}
                    />
                  </FormItem>
                )}
              />
              <span className="text-sm text-destructive">
                {form.formState.errors?.endTime?.message}
              </span>
            </div>
            <FormField
              control={form.control}
              name="requiredAssistantNumber"
              render={({ field }) => (
                <FormItem>
                  <Label>助理人数</Label>
                  <FormControl>
                    <NumberInput
                      placeholder="请输入助理人数"
                      min={1}
                      max={100}
                      defaultValue={1}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="ml-auto">
              <Button type="submit">确定</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
