import { PendingButton } from "@/components/pending-button";
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
import { submitYourAvailability } from "@/lib/api";
import { DayOfWeek } from "@/lib/const";
import {
  getScheduleTemplateQueryOptions,
  getYourSubmissionQueryOptions,
} from "@/lib/queryOptions";
import { AvailabilitySubmissionItem, SchedulePlan } from "@/lib/types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { format, isBefore, parse } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  schedulePlan: SchedulePlan;
}

export default function EngageSchedulePlanCard({ schedulePlan }: Props) {
  const { data: scheduleTemplate } = useSuspenseQuery(
    getScheduleTemplateQueryOptions(schedulePlan.scheduleTemplateID)
  );

  const { data: yourSubmission } = useSuspenseQuery(
    getYourSubmissionQueryOptions(schedulePlan.id)
  );

  const submitMutation = useMutation({
    mutationFn: () =>
      submitYourAvailability({
        schedulePlanID: schedulePlan.id,
        items: availabilities,
      }).then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res.message);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [availabilities, setAvailabilities] = useState<
    AvailabilitySubmissionItem[]
  >(() =>
    scheduleTemplate.shifts.map((s) => ({
      shiftID: s.id,
      days: yourSubmission?.items.find((i) => i.shiftID === s.id)?.days ?? [],
    }))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{schedulePlan.name}</CardTitle>
        <CardDescription>
          {schedulePlan.description || "此排班计划没有描述"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <span>开放提交时间: </span>
            <span className="underline underline-offset-4">
              {format(
                schedulePlan.submissionStartTime,
                "yyyy-MM-dd EEEE HH:mm:ss",
                {
                  locale: zhCN,
                }
              )}{" "}
              到{" "}
              {format(
                schedulePlan.submissionEndTime,
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
                schedulePlan.activeStartTime,
                "yyyy-MM-dd EEEE HH:mm:ss",
                {
                  locale: zhCN,
                }
              )}{" "}
              到{" "}
              {format(schedulePlan.activeEndTime, "yyyy-MM-dd EEEE HH:mm:ss", {
                locale: zhCN,
              })}
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
              {scheduleTemplate.shifts.some((s) =>
                s.applicableDays.includes(day.key)
              ) ? (
                <div className="grid gap-4">
                  {scheduleTemplate.shifts
                    .filter((s) => s.applicableDays.includes(day.key))
                    .sort((a, b) =>
                      isBefore(
                        parse(a.startTime, "HH:mm:ss", new Date()),
                        parse(b.startTime, "HH:mm:ss", new Date())
                      )
                        ? -1
                        : 1
                    )
                    .map((s) => (
                      <div className="flex justify-between rounded-md border border-border py-4 px-4">
                        <span className="text-sm text-muted-foreground">
                          {s.startTime}~{s.endTime}（{s.requiredAssistantNumber}
                          名助理）
                        </span>
                        <Switch
                          disabled={submitMutation.isPending}
                          checked={availabilities
                            .find((a) => a.shiftID === s.id)
                            ?.days.includes(day.key)}
                          onCheckedChange={(checked) => {
                            setAvailabilities((prev) => {
                              const target = prev.find(
                                (a) => a.shiftID === s.id
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
  );
}
