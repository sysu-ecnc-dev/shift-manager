import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { confirmChangeEmail, requireChangeEmail } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { PendingButton } from "../pending-button";

const schema = z.object({
  newEmail: z.string().email("请输入有效的邮箱"),
  otp: z.string().length(6, "验证码必须是 6 位数字"),
});

export default function ChangeEmailForm() {
  const {
    register,
    trigger,
    watch,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const [countdown, setCountdown] = useState(0);
  const newEmail = watch("newEmail");

  const requireMutation = useMutation({
    mutationFn: (data: { newEmail: string }) =>
      requireChangeEmail(data).then((res) => res.data),
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
    mutationFn: (data: z.infer<typeof schema>) =>
      confirmChangeEmail(data).then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res.message);
      reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onClickSendOTP = async () => {
    const isValid = await trigger(["newEmail"]);

    if (isValid) {
      requireMutation.mutate({ newEmail });
    }
  };

  const onSubmit = (data: z.infer<typeof schema>) => {
    confirmMutation.mutate(data);
  };

  return (
    <form
      className="flex flex-col gap-2 max-w-lg"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-2">
        <span>新邮箱</span>
        <Input
          placeholder="请输入新邮箱"
          disabled={requireMutation.isPending || confirmMutation.isPending}
          {...register("newEmail")}
        />
        {errors.newEmail && (
          <span className="text-destructive text-sm">
            {errors.newEmail.message}
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <span>验证码</span>
        <div className="flex gap-2">
          <Input
            placeholder="请输入验证码"
            {...register("otp")}
            disabled={requireMutation.isPending || confirmMutation.isPending}
          />
          <Button
            type="button"
            onClick={onClickSendOTP}
            disabled={
              countdown > 0 ||
              requireMutation.isPending ||
              confirmMutation.isPending
            }
          >
            {countdown > 0 ? `重新发送 (${countdown})` : "发送验证码"}
          </Button>
        </div>
      </div>
      {errors.otp && (
        <span className="text-destructive text-sm">{errors.otp.message}</span>
      )}
      <div className="mt-2">
        {requireMutation.isPending || confirmMutation.isPending ? (
          <PendingButton />
        ) : (
          <Button type="submit">确定</Button>
        )}
      </div>
    </form>
  );
}
