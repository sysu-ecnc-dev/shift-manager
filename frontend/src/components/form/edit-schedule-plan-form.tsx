import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SchedulePlan } from "@/lib/types";
import { formatISO, parseISO } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateRangePicker } from "@/components/date-range-picker";
import { updateSchedulePlan } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PendingButton } from "@/components/pending-button";
import { Button } from "@/components/ui/button";

const schema = z
  .object({
    name: z.string().min(1, { message: "名称不能为空" }),
    description: z.string(),
    submissionStartTime: z.date().optional(),
    submissionEndTime: z.date().optional(),
    activeStartTime: z.date().optional(),
    activeEndTime: z.date().optional(),
  })
  .refine((data) => data.submissionStartTime && data.submissionEndTime, {
    message: "开放提交的日期为空",
    path: ["submissionStartDate"],
  })
  .refine((data) => data.activeStartTime && data.activeEndTime, {
    message: "生效日期为空",
    path: ["activeStartDate"],
  });

interface Props {
  schedulePlan: SchedulePlan;
  onDialogOpenChange: (open: boolean) => void;
}

export default function EditSchedulePlanForm({
  schedulePlan,
  onDialogOpenChange,
}: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: schedulePlan.name,
      description: schedulePlan.description,
      submissionStartTime: parseISO(schedulePlan.submissionStartTime),
      submissionEndTime: parseISO(schedulePlan.submissionEndTime),
      activeStartTime: parseISO(schedulePlan.activeStartTime),
      activeEndTime: parseISO(schedulePlan.activeEndTime),
    },
  });

  const submissionStartTime = form.watch("submissionStartTime");
  const submissionEndTime = form.watch("submissionEndTime");
  const activeStartTime = form.watch("activeStartTime");
  const activeEndTime = form.watch("activeEndTime");
  const queryClient = useQueryClient();

  const updateSchedulePlanMutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      updateSchedulePlan(schedulePlan.id, {
        ...data,
        submissionStartTime: formatISO(data.submissionStartTime!),
        submissionEndTime: formatISO(data.submissionEndTime!),
        activeStartTime: formatISO(data.activeStartTime!),
        activeEndTime: formatISO(data.activeEndTime!),
      }).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["schedule-plans"], (old: SchedulePlan[]) =>
        old.map((plan) => (plan.id === schedulePlan.id ? res.data : plan))
      );
      toast.success(res.message);
      onDialogOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    updateSchedulePlanMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      {/* name */}
      <div className="grid gap-2">
        <Label>排班计划名称</Label>
        <Input
          {...form.register("name")}
          placeholder="请输入排班计划名称"
          autoComplete="off"
        />
        {form.formState.errors.name && (
          <p className="text-destructive text-sm">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      {/* description */}
      <div className="grid gap-2">
        <Label>排班计划描述</Label>
        <Textarea
          {...form.register("description")}
          className="resize-none"
          placeholder="请输入排班计划描述（可选）"
          autoComplete="off"
        />
      </div>
      {/* submissionDate */}
      <DateRangePicker
        label="开放提交日期"
        startDate={submissionStartTime}
        endDate={submissionEndTime}
        onRangeChange={({ start, end }) => {
          form.setValue("submissionStartTime", start);
          form.setValue("submissionEndTime", end);
        }}
        error={form.formState.errors.submissionStartTime?.message}
      />
      {/* activeDate */}
      <DateRangePicker
        label="生效日期"
        startDate={activeStartTime}
        endDate={activeEndTime}
        onRangeChange={({ start, end }) => {
          form.setValue("activeStartTime", start);
          form.setValue("activeEndTime", end);
        }}
        error={form.formState.errors.activeStartTime?.message}
      />
      {/* button */}
      <div className="flex justify-end">
        {updateSchedulePlanMutation.isPending ? (
          <PendingButton />
        ) : (
          <Button type="submit">保存</Button>
        )}
      </div>
    </form>
  );
}
