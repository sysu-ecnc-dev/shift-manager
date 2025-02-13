import { ScheduleTemplate } from "@/lib/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateScheduleTemplate } from "@/lib/api";
import { toast } from "sonner";
import { PendingButton } from "@/components/pending-button";

interface Props {
  originalScheduleTemplate: ScheduleTemplate;
  onDialogOpenChange: (open: boolean) => void;
}

const schema = z.object({
  name: z.string().min(1, "名称不能为空"),
  description: z.string(),
});

export default function UpdateScheduleTemplateForm({
  originalScheduleTemplate,
  onDialogOpenChange,
}: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: originalScheduleTemplate.name,
      description: originalScheduleTemplate.description,
    },
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => {
      return updateScheduleTemplate(originalScheduleTemplate.id, data).then(
        (res) => res.data
      );
    },
    onSuccess: (res) => {
      queryClient.setQueryData(
        ["schedule-templates"],
        (old: ScheduleTemplate[]) =>
          old.map((template) =>
            template.id === originalScheduleTemplate.id ? res.data : template
          )
      );
      toast.success(res.message);
      onDialogOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>模板名称</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="请输入模板名称"
                  disabled={updateMutation.isPending}
                  autoComplete="false"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>模板描述</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="请输入模板描述（可选）"
                  className="resize-none"
                  disabled={updateMutation.isPending}
                  autoComplete="false"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          {updateMutation.isPending ? (
            <PendingButton />
          ) : (
            <Button type="submit">提交</Button>
          )}
        </div>
      </form>
    </Form>
  );
}
