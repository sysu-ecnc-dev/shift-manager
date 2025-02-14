import AddShiftDialog from "@/components/dialog/add-shift-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createScheduleTemplate } from "@/lib/api";
import { DayOfWeek } from "@/lib/const";
import { ScheduleTemplate } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PendingButton } from "@/components/pending-button";
import useAddScheduleTemplateDialogStore from "@/store/use-add-schedule-template-dialog-store";

const schema = z.object({
  name: z.string().min(1, { message: "模板名称不能为空" }),
  description: z.string(),
  shifts: z.array(
    z.object({
      startTime: z.string().time({ precision: 0, message: "开始时间格式错误" }),
      endTime: z.string().time({ precision: 0, message: "结束时间格式错误" }),
      requiredAssistantNumber: z.number().min(1, {
        message: "所需助理人数不能小于1",
      }),
      applicableDays: z.array(
        z.number().min(1).max(7, { message: "适用天数必须在1-7之间" })
      ),
    })
  ),
});

export default function AddScheduleTemplateForm() {
  const { setOpen } = useAddScheduleTemplateDialogStore();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      shifts: [],
    },
  });

  const shifts = form.watch("shifts");
  const queryClient = useQueryClient();
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);

  const createScheduleTemplateMutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      createScheduleTemplate(data).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(
        ["schedule-templates"],
        (old: ScheduleTemplate[]) => [...old, res.data]
      );
      setOpen(false);
      toast.success(res.message);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    createScheduleTemplateMutation.mutate(data);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        {/* meta */}
        <div className="grid gap-2">
          {/* 模板名称 */}
          <div className="grid gap-2 grid-cols-6 items-center">
            <Label className="col-span-1 text-right">模板名称</Label>
            <Input
              className="col-span-5"
              {...form.register("name")}
              placeholder="请输入模板名称"
              autoComplete="off"
            />
            {form.formState.errors.name && (
              <span className="col-span-5 col-start-2 text-destructive text-sm">
                {form.formState.errors.name.message}
              </span>
            )}
          </div>
          {/* 模板描述 */}
          <div className="grid gap-2 grid-cols-6 items-center">
            <Label className="col-span-1 text-right">模板描述</Label>
            <Input
              className="col-span-5"
              {...form.register("description")}
              placeholder="请输入模板描述（可选）"
              autoComplete="off"
            />
          </div>
        </div>
        <Separator className="my-2" />
        {/* shifts */}
        <div className="grid grid-cols-6 items-center">
          <Label className="col-span-1 text-center mr-2">班次</Label>
          <div className="col-span-2 col-start-6 flex justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setAddShiftDialogOpen(true);
              }}
            >
              添加班次
            </Button>
          </div>
        </div>
        <Tabs defaultValue="1" className="grid gap-2">
          <TabsList className="grid grid-cols-7">
            {DayOfWeek.map((day) => (
              <TabsTrigger value={day.key.toString()} key={day.key}>
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {DayOfWeek.map((day) => (
            <TabsContent value={day.key.toString()} key={day.key}>
              {shifts.length == 0 ? (
                <div className="text-sm text-muted-foreground text-center border-border border border-dashed rounded-md py-4">
                  请通过上方的"添加班次"按钮来添加班次
                </div>
              ) : (
                <div className="grid gap-2">
                  {shifts.map((shift) => (
                    <div
                      key={shift.startTime}
                      className="text-sm text-muted-foreground border-border border rounded-md py-4 flex justify-between px-4"
                    >
                      <div>
                        {shift.startTime} - {shift.endTime}（
                        {shift.requiredAssistantNumber}
                        人）
                      </div>
                      <div className="flex gap-4 items-center">
                        <Switch
                          checked={shift.applicableDays.includes(day.key)}
                          onCheckedChange={(checked) => {
                            form.setValue(
                              "shifts",
                              shifts.map((s) => {
                                if (s.startTime === shift.startTime) {
                                  return {
                                    ...s,
                                    applicableDays: checked
                                      ? [...s.applicableDays, day.key]
                                      : s.applicableDays.filter(
                                          (d) => d !== day.key
                                        ),
                                  };
                                }
                                return s;
                              })
                            );
                          }}
                        />
                        <div className="cursor-pointer">
                          <X
                            className="w-4 h-4"
                            onClick={() => {
                              form.setValue(
                                "shifts",
                                shifts.filter(
                                  (s) => s.startTime !== shift.startTime
                                )
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        {/* button */}
        <div className="ml-auto mt-2">
          {createScheduleTemplateMutation.isPending ? (
            <PendingButton />
          ) : (
            <Button type="submit">提交</Button>
          )}
        </div>
      </form>
      {/* 添加班次的 dialog */}
      <AddShiftDialog
        open={addShiftDialogOpen}
        onOpenChange={setAddShiftDialogOpen}
      />
    </FormProvider>
  );
}
