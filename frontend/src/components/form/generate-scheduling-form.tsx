import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateSchedulingResult } from "@/lib/api";
import useGenerateSchedulingDialogStore from "@/store/use-generate-scheduling-dialog-store";
import useSchedulingSubmissionStore from "@/store/use-scheduling-submission-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const schema = z.object({
  populationSize: z
    .number({ message: "请输入数字" })
    .min(1, { message: "种群数量必须大于 0" }),
  maxGenerations: z
    .number({ message: "请输入数字" })
    .min(1, { message: "迭代次数必须大于 0" }),
  crossoverRate: z
    .number({ message: "请输入数字" })
    .min(0, { message: "交叉率必须大于 0" })
    .max(1, { message: "交叉率必须小于 1" }),
  mutationRate: z
    .number({ message: "请输入数字" })
    .min(0, { message: "变异率必须大于 0" })
    .max(1, { message: "变异率必须小于 1" }),
  EliteCount: z
    .number({ message: "请输入数字" })
    .min(1, { message: "每一代保留的精英数量必须大于 0" }),
  FairnessWeight: z
    .number({ message: "请输入数字" })
    .min(0, { message: "公平性权重必须大于 0" }),
});

export default function GenerateSchedulingForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      populationSize: 50,
      maxGenerations: 100,
      crossoverRate: 0.7,
      mutationRate: 0.1,
      EliteCount: 10,
      FairnessWeight: 0.5,
    },
  });

  const { setSchedulingSubmission } = useSchedulingSubmissionStore();
  const { schedulePlanID, setOpen } = useGenerateSchedulingDialogStore();

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      generateSchedulingResult(schedulePlanID, data).then((res) => res.data),
    onSuccess: (res) => {
      setSchedulingSubmission(res.data);
      toast.success(res.message);
      setOpen(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
        <FormField
          control={form.control}
          name="populationSize"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center space-y-0 gap-2">
              <FormLabel className="col-span-1 text-right">种群数量</FormLabel>
              <FormControl className="col-start-2 col-span-5">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              {form.formState.errors.populationSize ? (
                <FormMessage className="col-start-2 col-span-5" />
              ) : (
                <FormDescription className="col-start-2 col-span-5">
                  种群数量越大，生成的排班方案越多，但计算时间也会更长
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxGenerations"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center space-y-0 gap-2">
              <FormLabel className="col-span-1 text-right">迭代次数</FormLabel>
              <FormControl className="col-start-2 col-span-5">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              {form.formState.errors.maxGenerations ? (
                <FormMessage className="col-start-2 col-span-5" />
              ) : (
                <FormDescription className="col-start-2 col-span-5">
                  迭代次数越多，计算时间越长，但生成的排班方案质量越高
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="crossoverRate"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center space-y-0 gap-2">
              <FormLabel className="col-span-1 text-right">交叉率</FormLabel>
              <FormControl className="col-start-2 col-span-5">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              {form.formState.errors.crossoverRate ? (
                <FormMessage className="col-start-2 col-span-5" />
              ) : (
                <FormDescription className="col-start-2 col-span-5">
                  交叉率越大，排班方案的多样性越高，但是可能导致排班质量较差
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mutationRate"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center space-y-0 gap-2">
              <FormLabel className="col-span-1 text-right">变异率</FormLabel>
              <FormControl className="col-start-2 col-span-5">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              {form.formState.errors.mutationRate ? (
                <FormMessage className="col-start-2 col-span-5" />
              ) : (
                <FormDescription className="col-start-2 col-span-5">
                  变异率越大，排班方案的多样性越高，但是可能导致排班质量较差
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="EliteCount"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center space-y-0 gap-2">
              <FormLabel className="col-span-1 text-right">精英数量</FormLabel>
              <FormControl className="col-start-2 col-span-5">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              {form.formState.errors.EliteCount ? (
                <FormMessage className="col-start-2 col-span-5" />
              ) : (
                <FormDescription className="col-start-2 col-span-5">
                  留下的精英数量越多，排班结果也越稳定，但会错过更好的排班方案
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="FairnessWeight"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center space-y-0 gap-2">
              <FormLabel className="col-span-1 text-right">
                公平性权重
              </FormLabel>
              <FormControl className="col-start-2 col-span-5">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              {form.formState.errors.FairnessWeight ? (
                <FormMessage className="col-start-2 col-span-5" />
              ) : (
                <FormDescription className="col-start-2 col-span-5">
                  公平性权重影响排每个助理的工作时间分布的均匀程度
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending} className="ml-auto">
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2" />
              生成中...
            </>
          ) : (
            "生成排班"
          )}
        </Button>
      </form>
    </Form>
  );
}
