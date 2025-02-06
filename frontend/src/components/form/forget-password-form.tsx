import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { confirmResetPassword, requireResetPassword } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { PendingButton } from "../pending-button";
import { Separator } from "../ui/separator";

const passwordSchema = z
  .string()
  .min(8, "密码不能少于 8 位")
  .regex(/[A-Za-z]/, "密码必须要包含一个字母")
  .regex(/[0-9]/, "密码必须要包含一个数字");

const schema = z
  .object({
    username: z.string().min(1, "用户名不能为空"),
    otp: z.string().length(6, "验证码长度为6位"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "确认密码必须要和新密码一致",
    path: ["confirmPassword"],
  });

export default function ForgetPasswordForm() {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const username = watch("username");

  const requireMutation = useMutation({
    mutationFn: (data: { username: string }) =>
      requireResetPassword(data).then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res.message);
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (data: { username: string; otp: string; password: string }) =>
      confirmResetPassword(data).then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res.message);
      reset();
      navigate({ to: "/auth/login", replace: true });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onRequire = async () => {
    const isValid = await trigger(["username"]);
    if (isValid) {
      requireMutation.mutate({ username });
    }
  };

  const onSubmit = (data: z.infer<typeof schema>) => {
    confirmMutation.mutate({
      username: data.username,
      otp: data.otp,
      password: data.newPassword,
    });
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">忘记密码？</h1>
        <p>通过发送到你邮箱中的验证码来重置密码</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <span>用户名</span>
          <Input
            {...register("username")}
            placeholder="请输入你的用户名（NetID）"
            disabled={requireMutation.isPending || confirmMutation.isPending}
          />
          {errors.username && (
            <span className="text-destructive text-sm">
              {errors.username.message}
            </span>
          )}
        </div>
        <div className="grid gap-2">
          <span>验证码</span>
          <div className="flex items-center gap-2">
            <Input
              {...register("otp")}
              placeholder="请输入你的验证码"
              disabled={requireMutation.isPending || confirmMutation.isPending}
            />
            <Button
              disabled={
                countdown > 0 ||
                requireMutation.isPending ||
                confirmMutation.isPending
              }
              onClick={onRequire}
              type="button"
            >
              {countdown > 0 ? `重新发送 (${countdown})` : "发送验证码"}
            </Button>
          </div>
          {errors.otp && (
            <span className="text-destructive text-sm">
              {errors.otp.message}
            </span>
          )}
        </div>
        <div className="grid gap-2">
          <span>新密码</span>
          <Input
            {...register("newPassword")}
            placeholder="请输入你的新密码"
            disabled={requireMutation.isPending || confirmMutation.isPending}
            type="password"
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
            placeholder="请输入你的确认密码"
            disabled={requireMutation.isPending || confirmMutation.isPending}
            type="password"
          />
          {errors.confirmPassword && (
            <span className="text-destructive text-sm">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>
        {requireMutation.isPending || confirmMutation.isPending ? (
          <PendingButton />
        ) : (
          <Button type="submit">确定</Button>
        )}
      </div>
      <Separator className="my-2" />
      <div className="text-center text-sm text-muted-foreground">
        用户名对应的邮箱邮箱默认是你的中山大学邮箱
      </div>
    </form>
  );
}
