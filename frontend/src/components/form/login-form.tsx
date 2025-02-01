import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PendingButton } from "@/components/pending-button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const schema = z.object({
  username: z.string().min(1, { message: "用户名不能为空" }),
  password: z.string().min(1, { message: "密码不能为空" }),
});

export default function LoginForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      login(data).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data.data);
      navigate({ to: "/", replace: true });
      toast.success("登录成功");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    loginMutation.mutate(data);
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">登录到你的账户</h1>
        <p>输入你的用户名（NetID）和密码以登录</p>
      </div>
      <div className="grid gap-6">
        {/* 用户名 */}
        <div className="grid gap-2">
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            placeholder="请输入你的用户名（NetID）"
            disabled={loginMutation.isPending}
            {...form.register("username")}
          />
        </div>
        {/* 密码 */}
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">密码</Label>
            <Link
              to="/auth/login"
              className="ml-auto text-sm hover:underline underline-offset-4"
            >
              忘记密码？
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="请输入你的密码"
            disabled={loginMutation.isPending}
            {...form.register("password")}
          />
        </div>
        {/* 登录按钮 */}
        {loginMutation.isPending ? (
          <PendingButton />
        ) : (
          <Button type="submit" className="w-full">
            登录
          </Button>
        )}
      </div>
    </form>
  );
}
