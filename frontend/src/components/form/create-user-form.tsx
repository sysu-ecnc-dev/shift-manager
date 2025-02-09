import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser } from "@/lib/api";
import { User } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PendingButton } from "../pending-button";

const schema = z.object({
  username: z.string().min(1, "请输入用户名"),
  fullName: z.string().min(1, "请输入姓名"),
  email: z.string().email("请输入正确的邮箱"),
  role: z.string().min(1, "请选择角色"),
});

interface props {
  onDialogOpenChange: (open: boolean) => void;
}

export default function CreateUserForm({ onDialogOpenChange }: props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      role: "",
    },
  });

  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      createUser(data).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["users"], (oldData: User[]) => [
        ...oldData,
        res.data,
      ]);
      toast.success(res.message);
      onDialogOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    createUserMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-2 space-y-0">
              <FormLabel className="col-span-1 text-right">用户名</FormLabel>
              <FormControl className="col-span-5">
                <Input
                  {...field}
                  placeholder="请输入用户名（NetID）"
                  autoComplete="off"
                  disabled={createUserMutation.isPending}
                />
              </FormControl>
              <FormMessage className="col-span-5 col-start-2" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-2 space-y-0">
              <FormLabel className="col-span-1 text-right">姓名</FormLabel>
              <FormControl className="col-span-5">
                <Input
                  {...field}
                  placeholder="请输入姓名"
                  autoComplete="off"
                  disabled={createUserMutation.isPending}
                />
              </FormControl>
              <FormMessage className="col-span-5 col-start-2" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-2 space-y-0">
              <FormLabel className="col-span-1 text-right">邮箱</FormLabel>
              <FormControl className="col-span-5">
                <Input
                  {...field}
                  placeholder="请输入邮箱"
                  autoComplete="off"
                  disabled={createUserMutation.isPending}
                />
              </FormControl>
              <FormMessage className="col-span-5 col-start-2" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-2 space-y-0">
              <FormLabel className="col-span-1 text-right">角色</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={createUserMutation.isPending}
              >
                <FormControl className="col-span-5">
                  <SelectTrigger>
                    <SelectValue placeholder="请选择角色" />
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
          {createUserMutation.isPending ? (
            <PendingButton />
          ) : (
            <Button type="submit">提交</Button>
          )}
        </div>
      </form>
    </Form>
  );
}
