import { useState, FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/features/auth/authSlice";
import apiClient from "@/shared/api/apiClient";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    dispatch(loginStart());
    try {
      const response = await apiClient.post("/auth/login", {
        username: values.username,
        password: values.password,
      });
      const data = response.data;
      const token = data.accessToken;
      const user = {
        id: data.id,
        username: data.username,
        ten: data.ten,
        roles: data.roles,
      };
      dispatch(loginSuccess({ token, user }));
      navigate("/");
    } catch (err: any) {
      const message = err.response?.data?.message || "Đăng nhập thất bại";
      dispatch(loginFailure(message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-cyan-50/30 to-cyan-100/50 p-4">
      <Card className="w-full max-w-[400px] overflow-hidden border-white/40 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
        <CardHeader className="space-y-2 pb-6 pt-10 text-center">
          <div className="mb-2 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-50 to-white shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <img
                src="/favicon.png"
                alt="System Logo"
                className="h-16 w-16 object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-[22px] font-bold tracking-tight text-slate-700">
            Lab Platform
          </CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 px-8 pb-10">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-100 bg-red-50/50 py-2 text-red-600"
                >
                  <AlertDescription className="text-xs font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[13px] font-medium text-slate-600">
                      Tên đăng nhập
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên đăng nhập"
                        className="h-10 border-slate-100 bg-white shadow-sm transition-all focus-visible:border-cyan-300 focus-visible:ring-1 focus-visible:ring-cyan-300"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[13px] font-medium text-slate-600">
                      Mật khẩu
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          className="h-10 border-slate-100 bg-white pr-10 shadow-sm transition-all focus-visible:border-cyan-300 focus-visible:ring-1 focus-visible:ring-cyan-300"
                          disabled={isLoading}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 transition-colors hover:text-cyan-500"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px] text-red-500" />
                  </FormItem>
                )}
              />

              <div className="pt-3">
                <Button
                  type="submit"
                  className="h-10 w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-[14px] font-semibold text-white shadow-[0_2px_10px_rgba(34,211,238,0.25)] transition-all hover:from-cyan-500 hover:to-cyan-600 hover:shadow-[0_2px_15px_rgba(34,211,238,0.35)] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>

      <div className="z-12 absolute bottom-6 w-full text-center text-sm font-medium text-slate-600">
        <p>© 2025 System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginPage;
