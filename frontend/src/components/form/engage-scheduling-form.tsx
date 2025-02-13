import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLatestSubmissionAvailablePlan } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format, isBefore, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DayOfWeek } from "@/lib/const";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function EngageSchedulingForm() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["latest-available-schedule-plan"],
    queryFn: () =>
      getLatestSubmissionAvailablePlan().then((res) => res.data.data),
  });

  if (isPending) {
    return null;
  }

  if (isError) {
    toast.error(error.message);
    return null;
  }

  if (data === null) {
    return (
      <div className="flex-1 border border-border border-dashed flex items-center justify-center text-muted-foreground">
        现在没有可以参与的排班计划
      </div>
    );
  }

  return (
    <div className="w-max mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{data.plan.name}</CardTitle>
          <CardDescription>
            {data.plan.description || "此排班计划没有描述"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <span>开放提交时间: </span>
              <span className="underline underline-offset-4">
                {format(
                  data.plan.submissionStartTime,
                  "yyyy-MM-dd EEEE HH:mm:ss",
                  {
                    locale: zhCN,
                  }
                )}{" "}
                到{" "}
                {format(
                  data.plan.submissionEndTime,
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
                {format(data.plan.activeStartTime, "yyyy-MM-dd EEEE HH:mm:ss", {
                  locale: zhCN,
                })}{" "}
                到{" "}
                {format(data.plan.activeEndTime, "yyyy-MM-dd EEEE HH:mm:ss", {
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
                {data.template.shifts.some((s) =>
                  s.applicableDays.includes(day.key)
                ) ? (
                  <div className="grid gap-4">
                    {data.template.shifts
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
                          <Switch />
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
            <Button>提交</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
