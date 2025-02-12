import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, addMonths, endOfDay, formatISO, startOfDay } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { createSchedulePlan, getAllScheduleTemplateMeta } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchedulePlan } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PendingButton } from "@/components/pending-button";

const schema = z
  .object({
    name: z.string().min(1, { message: "名称不能为空" }),
    description: z.string(),
    submissionStartTime: z.date().optional(),
    submissionEndTime: z.date().optional(),
    activeStartTime: z.date().optional(),
    activeEndTime: z.date().optional(),
    templateName: z.string().min(1, { message: "模板名称不能为空" }),
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
  onDialogOpenChange: (open: boolean) => void;
}

export default function AddSchedulePlanForm({ onDialogOpenChange }: Props) {
  const now = new Date();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      submissionStartTime: startOfDay(now),
      submissionEndTime: endOfDay(addDays(now, 7)),
      activeStartTime: startOfDay(addDays(now, 10)),
      activeEndTime: endOfDay(addMonths(now, 5)),
      templateName: "",
    },
  });

  const submissionStartTime = form.watch("submissionStartTime");
  const submissionEndTime = form.watch("submissionEndTime");
  const activeStartTime = form.watch("activeStartTime");
  const activeEndTime = form.watch("activeEndTime");
  const queryClient = useQueryClient();

  // 提交班表计划
  const submitSchedulePlanMutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      createSchedulePlan({
        ...data,
        submissionStartDate: formatISO(data.submissionStartTime!),
        submissionEndDate: formatISO(data.submissionEndTime!),
        activeStartDate: formatISO(data.activeStartTime!),
        activeEndDate: formatISO(data.activeEndTime!),
      }).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["schedule-plans"], (old: SchedulePlan[]) => [
        ...old,
        res.data,
      ]);
      onDialogOpenChange(false);
      toast.success(res.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    submitSchedulePlanMutation.mutate(data);
  };

  // 获取班表模板列表
  const {
    data: scheduleTemplateList,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["schedule-templates"],
    queryFn: () => getAllScheduleTemplateMeta().then((res) => res.data.data),
  });

  if (isPending) return null;

  if (isError) {
    toast.error(error.message);
    return null;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      {/* name */}
      <div className="grid gap-2">
        <Label>排班计划名称</Label>
        <Input
          {...form.register("name")}
          placeholder="请输入排班计划名称"
          autoComplete="off"
          disabled={submitSchedulePlanMutation.isPending}
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
          disabled={submitSchedulePlanMutation.isPending}
        />
      </div>
      {/* submissionDate */}
      <div className="grid gap-2">
        <Label>开放提交日期</Label>
        <Popover modal={true}>
          <PopoverTrigger
            asChild
            disabled={submitSchedulePlanMutation.isPending}
          >
            <Button
              variant="outline"
              className={cn(
                "justify-start",
                !submissionStartTime && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {submissionStartTime ? (
                submissionEndTime ? (
                  <>
                    {format(submissionStartTime, "yyyy-MM-dd HH:mm:ss EEEE", {
                      locale: zhCN,
                    })}{" "}
                    ~{" "}
                    {format(submissionEndTime, "yyyy-MM-dd HH:mm:ss EEEE", {
                      locale: zhCN,
                    })}
                  </>
                ) : (
                  format(submissionStartTime, "yyyy-MM-dd HH:mm:ss EEEE", {
                    locale: zhCN,
                  })
                )
              ) : (
                <span>请选择开放提交日期</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="range"
              selected={{ from: submissionStartTime, to: submissionEndTime }}
              onSelect={(date) => {
                form.setValue("submissionStartTime", date?.from);
                form.setValue(
                  "submissionEndTime",
                  date?.to
                    ? endOfDay(date.to)
                    : date?.from
                      ? endOfDay(date.from)
                      : undefined
                );
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {form.formState.errors.submissionStartTime && (
          <p className="text-destructive text-sm">
            {form.formState.errors.submissionStartTime.message}
          </p>
        )}
      </div>
      {/* activeDate */}
      <div className="grid gap-2">
        <Label>生效日期</Label>
        <Popover modal={true}>
          <PopoverTrigger
            asChild
            disabled={submitSchedulePlanMutation.isPending}
          >
            <Button
              variant="outline"
              className={cn(
                "justify-start",
                !activeStartTime && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {activeStartTime ? (
                activeEndTime ? (
                  <>
                    {format(activeStartTime, "yyyy-MM-dd HH:mm:ss EEEE", {
                      locale: zhCN,
                    })}{" "}
                    ~{" "}
                    {format(activeEndTime, "yyyy-MM-dd HH:mm:ss EEEE", {
                      locale: zhCN,
                    })}
                  </>
                ) : (
                  format(activeStartTime, "yyyy-MM-dd HH:mm:ss EEEE", {
                    locale: zhCN,
                  })
                )
              ) : (
                <span>请选择生效日期</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="range"
              selected={{ from: activeStartTime, to: activeEndTime }}
              onSelect={(date) => {
                form.setValue("activeStartTime", date?.from);
                form.setValue(
                  "activeEndTime",
                  date?.to
                    ? endOfDay(date.to)
                    : date?.from
                      ? endOfDay(date.from)
                      : undefined
                );
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {form.formState.errors.activeStartTime && (
          <p className="text-destructive text-sm">
            {form.formState.errors.activeStartTime.message}
          </p>
        )}
      </div>
      {/* templateName */}
      <div className="grid gap-2">
        <Label>使用的班表模板</Label>
        <Select
          onValueChange={(value) => form.setValue("templateName", value)}
          disabled={submitSchedulePlanMutation.isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="请选择班表模板" />
          </SelectTrigger>
          <SelectContent>
            {scheduleTemplateList.map((template) => (
              <SelectItem key={template.id} value={template.name}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.templateName && (
          <p className="text-destructive text-sm">
            {form.formState.errors.templateName.message}
          </p>
        )}
      </div>
      {/* button */}
      <div className="flex justify-end">
        {submitSchedulePlanMutation.isPending ? (
          <PendingButton />
        ) : (
          <Button type="submit">提交</Button>
        )}
      </div>
    </form>
  );
}
