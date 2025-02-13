import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { submitAvailability } from "@/lib/api";
import { DayOfWeek } from "@/lib/const";
import { SchedulePlan, ScheduleTemplate } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isBefore, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { PendingButton } from "../pending-button";

export default function EngageSchedulingForm() {
  const queryClient = useQueryClient();
  const planWithTemplate = queryClient.getQueryData<{
    plan: SchedulePlan;
    template: ScheduleTemplate;
  }>(["latest-available-schedule-plan"])!; // 这里可以保证 data 一定存在

  const [availabilities, setAvailabilities] = useState<
    {
      shiftId: number;
      days: number[];
    }[]
  >([]);

  const submitMutation = useMutation({
    mutationFn: () =>
      submitAvailability({ availabilities }).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(
        ["latest-available-schedule-plan", "your-submission"],
        res.data
      );
      toast.success(res.message);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // 先初始化 availabilities
  useLayoutEffect(() => {
    setAvailabilities(
      planWithTemplate.template.shifts.map((s) => ({
        shiftId: s.id,
        days: [],
      }))
    );
  }, [planWithTemplate]);

  return (
    <div className="w-max mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{planWithTemplate.plan.name}</CardTitle>
          <CardDescription>
            {planWithTemplate.plan.description || "此排班计划没有描述"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <span>开放提交时间: </span>
              <span className="underline underline-offset-4">
                {format(
                  planWithTemplate.plan.submissionStartTime,
                  "yyyy-MM-dd EEEE HH:mm:ss",
                  {
                    locale: zhCN,
                  }
                )}{" "}
                到{" "}
                {format(
                  planWithTemplate.plan.submissionEndTime,
                  "yyyy-MM-dd EEEE HH:mm:ss",
                  {
                    locale: zhCN,
                  }
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>排班启用时间: </span>
              <span className="underline underline-offset-4">
                {format(
                  planWithTemplate.plan.activeStartTime,
                  "yyyy-MM-dd EEEE HH:mm:ss",
                  {
                    locale: zhCN,
                  }
                )}{" "}
                到{" "}
                {format(
                  planWithTemplate.plan.activeEndTime,
                  "yyyy-MM-dd EEEE HH:mm:ss",
                  {
                    locale: zhCN,
                  }
                )}
              </span>
            </div>
          </div>
          <Separator className="my-4" />
          <Tabs defaultValue={DayOfWeek[0].key.toString()}>
            <TabsList className="grid grid-cols-7">
              {DayOfWeek.map((day) => (
                <TabsTrigger key={day.key} value={day.key.toString()}>
                  {day.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {DayOfWeek.map((day) => (
              <TabsContent key={day.key} value={day.key.toString()}>
                {planWithTemplate.template.shifts.some((s) =>
                  s.applicableDays.includes(day.key)
                ) ? (
                  <div className="grid gap-4">
                    {planWithTemplate.template.shifts
                      .filter((s) => s.applicableDays.includes(day.key))
                      .sort((a, b) =>
                        isBefore(parseISO(a.startTime), parseISO(b.startTime))
                          ? -1
                          : 1
                      )
                      .map((s) => (
                        <div className="flex justify-between rounded-md border border-border py-4 px-4">
                          <span className="text-sm text-muted-foreground">
                            {s.startTime}~{s.endTime}（
                            {s.requiredAssistantNumber}
                            名助理）
                          </span>
                          <Switch
                            disabled={submitMutation.isPending}
                            checked={availabilities
                              .find((a) => a.shiftId === s.id)
                              ?.days.includes(day.key)}
                            onCheckedChange={(checked) => {
                              setAvailabilities((prev) => {
                                const target = prev.find(
                                  (a) => a.shiftId === s.id
                                );
                                if (target) {
                                  target.days = checked
                                    ? [...target.days, day.key]
                                    : target.days.filter((d) => d !== day.key);
                                }
                                return [...prev];
                              });
                            }}
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-border py-4 px-4 text-center text-sm text-muted-foreground border-dashed">
                    当天没有排班
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
          <div className="flex justify-end mt-4">
            {submitMutation.isPending ? (
              <PendingButton />
            ) : (
              <Button onClick={() => submitMutation.mutate()}>提交</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
