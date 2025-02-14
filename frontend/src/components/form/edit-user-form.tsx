import useEditUserDialogStore from "@/store/use-edit-user-dialog-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/lib/api";
import { toast } from "sonner";
import { User } from "@/lib/types";
import { Loader2 } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(1, { message: "请输入姓名" }),
  email: z.string().email({ message: "请输入正确的邮箱" }),
  role: z.string().min(1, { message: "请选择角色" }),
  isActive: z.boolean(),
});

export default function EditUserForm() {
  const { user, setOpen } = useEditUserDialogStore();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName,
      email: user?.email,
      role: user?.role,
      isActive: user?.isActive,
    },
  });
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      updateUser(user!.id, data).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["users"], (old: User[]) =>
        old.map((user) => (user.id === res.data.id ? res.data : user))
      );
      toast.success(res.message);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
    >
      {/* 姓名 */}
      <div className="grid grid-cols-6 items-center gap-2">
        <Label className="col-span-1 text-right">姓名</Label>
        <Input
          {...form.register("fullName")}
          className="col-span-5"
          disabled={mutation.isPending}
        />
        {form.formState.errors.fullName && (
          <p className="col-start-2 col-span-5 text-destructive">
            {form.formState.errors.fullName.message}
          </p>
        )}
      </div>
      {/* 邮箱 */}
      <div className="grid grid-cols-6 items-center gap-2">
        <Label className="col-span-1 text-right">邮箱</Label>
        <Input
          {...form.register("email")}
          className="col-span-5"
          disabled={mutation.isPending}
        />
        {form.formState.errors.email && (
          <p className="col-start-2 col-span-5 text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      {/* 角色 */}
      <div className="grid grid-cols-6 items-center gap-2">
        <Label className="col-span-1 text-right">角色</Label>
        <Select
          onValueChange={(value) => form.setValue("role", value)}
          value={form.watch("role")}
          disabled={mutation.isPending}
        >
          <SelectTrigger className="col-span-5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="普通助理">普通助理</SelectItem>
            <SelectItem value="资深助理">资深助理</SelectItem>
            <SelectItem value="黑心">黑心</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* 是否在职 */}
      <div className="grid grid-cols-6 items-center gap-2">
        <Label className="col-span-1 text-right">在职</Label>
        <Switch
          checked={form.watch("isActive")}
          onCheckedChange={(checked) => form.setValue("isActive", checked)}
          className="col-start-6 place-self-end"
          disabled={mutation.isPending}
        />
      </div>
      {/* 按钮 */}
      <Button className="ml-auto mt-2" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 className="animate-spin" />
            请稍等
          </>
        ) : (
          "提交"
        )}
      </Button>
    </form>
  );
}
