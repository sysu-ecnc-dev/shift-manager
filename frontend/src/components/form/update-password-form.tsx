import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { updatePassword } from "@/lib/api";
import { toast } from "sonner";
import { PendingButton } from "@/components/pending-button";

const passwordSchema = z
  .string()
  .min(8, "密码不能少于 8 位")
  .regex(/[A-Za-z]/, "密码必须要包含一个字母")
  .regex(/[0-9]/, "密码必须要包含一个数字");

const schema = z
  .object({
    oldPassword: z.string().min(1, "旧密码不能为空"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "确认密码不能为空"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "确认密码必须要和新密码一致",
    path: ["confirmPassword"],
  });

export default function UpdatePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      updatePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }).then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res.message);
      reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    updatePasswordMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2 max-w-lg">
      <div className="grid gap-2">
        <span>旧密码</span>
        <Input
          {...register("oldPassword")}
          placeholder="请输入旧密码"
          type="password"
          disabled={updatePasswordMutation.isPending}
        />
        {errors.oldPassword && (
          <span className="text-destructive text-sm">
            {errors.oldPassword.message}
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <span>新密码</span>
        <Input
          {...register("newPassword")}
          placeholder="请输入新密码"
          type="password"
          disabled={updatePasswordMutation.isPending}
        />
        {errors.newPassword && (
          <span className="text-destructive text-sm">
            {errors.newPassword.message}
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <span>确认密码</span>
        <Input
          {...register("confirmPassword")}
          placeholder="请输入确认密码"
          type="password"
          disabled={updatePasswordMutation.isPending}
        />
        {errors.confirmPassword && (
          <span className="text-destructive text-sm">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>
      <div className="mt-2">
        {updatePasswordMutation.isPending ? (
          <PendingButton />
        ) : (
          <Button type="submit">确定</Button>
        )}
      </div>
    </form>
  );
}
