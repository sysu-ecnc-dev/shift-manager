import { PendingButton } from "@/components/pending-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSchedulePlan } from "@/lib/api";
import { SchedulePlan } from "@/lib/types";
import useEditSchedulePlanDialogStore from "@/store/use-edit-schedule-plan-dialog-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { endOfDay, formatISO, parseISO, startOfDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DateRangePicker } from "@/components/date-range-picker";

const schema = z.object({
  name: z.string().min(1, { message: "名称不能为空" }),
  description: z.string(),
  submissionStartTime: z.date({ required_error: "提交开始时间不能为空" }),
  submissionEndTime: z.date({ required_error: "提交结束时间不能为空" }),
  activeStartTime: z.date({ required_error: "生效开始时间不能为空" }),
  activeEndTime: z.date({ required_error: "生效结束时间不能为空" }),
});

export default function EditSchedulePlanForm() {
  const { schedulePlan, setOpen } = useEditSchedulePlanDialogStore();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: schedulePlan?.name,
      description: schedulePlan?.description,
      submissionStartTime: parseISO(schedulePlan?.submissionStartTime ?? ""),
      submissionEndTime: parseISO(schedulePlan?.submissionEndTime ?? ""),
      activeStartTime: parseISO(schedulePlan?.activeStartTime ?? ""),
      activeEndTime: parseISO(schedulePlan?.activeEndTime ?? ""),
    },
  });

  const queryClient = useQueryClient();

  const updateSchedulePlanMutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      updateSchedulePlan(schedulePlan!.id, {
        ...data,
        submissionStartTime: formatISO(data.submissionStartTime!),
        submissionEndTime: formatISO(data.submissionEndTime!),
        activeStartTime: formatISO(data.activeStartTime!),
        activeEndTime: formatISO(data.activeEndTime!),
      }).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["schedule-plans"], (old: SchedulePlan[]) =>
        old.map((plan) => (plan.id === schedulePlan!.id ? res.data : plan))
      );
      toast.success(res.message);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        updateSchedulePlanMutation.mutate(data)
      )}
      className="grid gap-4"
    >
      {/* name */}
      <div className="grid gap-2">
        <Label>排班计划名称</Label>
        <Input
          {...form.register("name")}
          placeholder="请输入排班计划名称"
          autoComplete="off"
          disabled={updateSchedulePlanMutation.isPending}
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
          disabled={updateSchedulePlanMutation.isPending}
        />
      </div>
      {/* 提交时间 */}
      <div className="grid gap-2">
        <Label>提交时间</Label>
        <DateRangePicker
          value={{
            from: form.watch("submissionStartTime"),
            to: form.watch("submissionEndTime"),
          }}
          onValueChange={(value) => {
            if (value?.from) {
              form.setValue("submissionStartTime", startOfDay(value.from));
              form.clearErrors("submissionStartTime");
            } else {
              form.unregister("submissionStartTime");
              form.setError("submissionStartTime", {
                message: "提交开始时间不能为空",
              });
            }
            if (value?.to) {
              form.setValue("submissionEndTime", endOfDay(value.to));
              form.clearErrors("submissionEndTime");
            } else {
              if (value?.from) {
                form.setValue("submissionEndTime", endOfDay(value.from));
                form.clearErrors("submissionEndTime");
              } else {
                form.unregister("submissionEndTime");
                form.setError("submissionEndTime", {
                  message: "提交结束时间不能为空",
                });
              }
            }
          }}
          disabled={updateSchedulePlanMutation.isPending}
          locale={zhCN}
        />
        {form.formState.errors.submissionStartTime ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.submissionStartTime.message}
          </p>
        ) : form.formState.errors.submissionEndTime ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.submissionEndTime.message}
          </p>
        ) : null}
      </div>
      {/* 生效时间 */}
      <div className="grid gap-2">
        <Label>生效时间</Label>
        <DateRangePicker
          value={{
            from: form.watch("activeStartTime"),
            to: form.watch("activeEndTime"),
          }}
          onValueChange={(value) => {
            if (value?.from) {
              form.setValue("activeStartTime", startOfDay(value.from));
              form.clearErrors("activeStartTime");
            } else {
              form.unregister("activeStartTime");
              form.setError("activeStartTime", {
                message: "生效开始时间不能为空",
              });
            }
            if (value?.to) {
              form.setValue("activeEndTime", endOfDay(value.to));
              form.clearErrors("activeEndTime");
            } else {
              if (value?.from) {
                form.setValue("activeEndTime", endOfDay(value.from));
                form.clearErrors("activeEndTime");
              } else {
                form.unregister("activeEndTime");
                form.setError("activeEndTime", {
                  message: "生效结束时间不能为空",
                });
              }
            }
          }}
          disabled={updateSchedulePlanMutation.isPending}
          locale={zhCN}
        />
        {form.formState.errors.activeStartTime ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.activeStartTime.message}
          </p>
        ) : form.formState.errors.activeEndTime ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.activeEndTime.message}
          </p>
        ) : null}
      </div>
      {/* button */}
      <div className="flex justify-end">
        {updateSchedulePlanMutation.isPending ? (
          <PendingButton />
        ) : (
          <Button type="submit">提交</Button>
        )}
      </div>
    </form>
  );
}
