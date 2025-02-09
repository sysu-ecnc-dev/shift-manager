import { User } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/lib/api";
import { toast } from "sonner";
import { PendingButton } from "@/components/pending-button";
import { Button } from "@/components/ui/button";

interface props {
  user: User;
  onDialogOpenChange: (open: boolean) => void;
}

const schema = z.object({
  role: z.string().min(1, "请选择一个角色"),
});

export default function UpdateUserRoleForm({
  user,
  onDialogOpenChange,
}: props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: user.role,
    },
  });

  const queryClient = useQueryClient();

  const updateUserRoleMutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      updateUser(user.id, data).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["users"], (old: User[]) =>
        old.map((user) => (user.id === res.data.id ? res.data : user))
      );
      toast.success(res.message);
      onDialogOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    updateUserRoleMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-4">
        <FormField
          name="role"
          control={form.control}
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-2 space-y-0">
              <FormLabel className="col-span-1 text-right">角色</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl className="col-span-5">
                  <SelectTrigger disabled={updateUserRoleMutation.isPending}>
                    <SelectValue placeholder="请选择一个角色" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="普通助理">普通助理</SelectItem>
                  <SelectItem value="资深助理">资深助理</SelectItem>
                  <SelectItem value="黑心">黑心</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="col-span-5 col-start-2" />
            </FormItem>
          )}
        />
        <div className="ml-auto">
          {updateUserRoleMutation.isPending ? (
            <PendingButton />
          ) : (
            <Button type="submit">提交</Button>
          )}
        </div>
      </form>
    </Form>
  );
}
