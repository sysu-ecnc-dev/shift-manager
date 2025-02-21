import GenerateSchedulingDialog from "@/components/dialog/generate-scheduling-dialog";
import { Button } from "@/components/ui/button";
import SchedulingArea from "@/feat/scheduling-area/scheduling-area";
import { submitSchedulingResult } from "@/lib/api";
import {
  getAllSubmissionsQueryOptions,
  getSchedulePlanQueryOptions,
  getScheduleTemplateQueryOptions,
  getSchedulingResultQueryOptions,
  getUsersQueryOptions,
} from "@/lib/queryOptions";
import useGenerateSchedulingDialogStore from "@/store/use-generate-scheduling-dialog-store";
import useSchedulingSubmissionStore from "@/store/use-scheduling-submission-store";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/management/schedule-plans/$id/scheduling"
)({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(
      getSchedulePlanQueryOptions(Number(params.id))
    );

    if (data) {
      await Promise.all([
        context.queryClient.ensureQueryData(
          getAllSubmissionsQueryOptions(data.id)
        ),
        context.queryClient.ensureQueryData(
          getScheduleTemplateQueryOptions(data.scheduleTemplateID)
        ),
        context.queryClient.ensureQueryData(
          getSchedulingResultQueryOptions(data.id)
        ),
        context.queryClient.ensureQueryData(getUsersQueryOptions()),
      ]);
    }
  },
});

function RouteComponent() {
  const { id: schedulePlanID } = Route.useParams();

  const queryClient = useQueryClient();

  const { data: schedulePlan } = useSuspenseQuery(
    getSchedulePlanQueryOptions(Number(schedulePlanID))
  );

  const { schedulingSubmission } = useSchedulingSubmissionStore();
  const { setOpen, setSchedulePlanID } = useGenerateSchedulingDialogStore();

  const submitMutation = useMutation({
    mutationFn: () =>
      submitSchedulingResult(Number(schedulePlanID), schedulingSubmission).then(
        (res) => res.data
      ),
    onSuccess: (res) => {
      queryClient.setQueryData(
        getSchedulingResultQueryOptions(Number(schedulePlanID)).queryKey,
        () => res.data
      );
      toast.success(res.message);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmitSchedulingResult = () => {
    submitMutation.mutate();
  };

  return (
    <>
      <div className="px-4 flex flex-col gap-2 mt-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">排班</h1>
            <span className="text-sm text-muted-foreground">
              在这里你可以根据提交情况来对{schedulePlan.name}进行排班
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(true);
                setSchedulePlanID(Number(schedulePlanID));
              }}
            >
              生成排班
            </Button>
            <Button
              onClick={onSubmitSchedulingResult}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className=" animate-spin" />
                  提交中...
                </>
              ) : (
                "提交排班"
              )}
            </Button>
          </div>
        </div>
        <SchedulingArea schedulePlan={schedulePlan} />
      </div>
      <GenerateSchedulingDialog />
    </>
  );
}
