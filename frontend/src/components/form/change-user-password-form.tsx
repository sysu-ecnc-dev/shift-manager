import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PasswordSchema } from "@/components/form/forget-password-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { updateUserPassword } from "@/lib/api";
import useChangeUserPasswordDialogStore from "@/store/use-change-user-password-dialog-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const schema = z
  .object({
    newPassword: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "确认密码必须要和新密码一致",
    path: ["confirmPassword"],
  });

export default function ChangeUserPasswordForm() {
  const { user, setOpen } = useChangeUserPasswordDialogStore();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) =>
      updateUserPassword(user!.id, { password: data.newPassword }).then(
        (res) => res.data
      ),
    onSuccess: (res) => {
      toast.success(res.message);
      setOpen(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className="grid gap-4"
    >
      <div className="grid grid-cols-6 items-center gap-2">
        <Label className="col-span-1 text-right">新密码</Label>
        <Input
          {...form.register("newPassword")}
          className="col-span-5"
          disabled={mutation.isPending}
          type="password"
        />
        {form.formState.errors.newPassword && (
          <p className="col-start-2 col-span-5 text-destructive">
            {form.formState.errors.newPassword.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-6 items-center gap-2">
        <Label className="col-span-1 text-right">确认密码</Label>
        <Input
          {...form.register("confirmPassword")}
          className="col-span-5"
          disabled={mutation.isPending}
          type="password"
        />
        {form.formState.errors.confirmPassword && (
          <p className="col-start-2 col-span-5 text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
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
