import { useState, FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

// Logic Redux
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
import { Eye, EyeOff, Loader2, GraduationCap } from "lucide-react";
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
    // Background: Màu xám xanh nhạt rất dịu
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] bg-gradient-to-b from-white to-[#f0f2f5] p-4">
      <Card className="w-full max-w-[400px] overflow-hidden rounded-xl border-none bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <CardHeader className="space-y-4 pb-6 pt-10 text-center">
          <div className="flex justify-center">
            {/* Icon: Nền tròn xám nhạt đúng chuẩn UI trong ảnh */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <GraduationCap className="h-6 w-6 text-slate-600" />
            </div>
          </div>
          <CardTitle className="text-[20px] font-bold tracking-tight text-[#0f172a]">
            Lab Platform
          </CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 px-8 pb-10">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-100 bg-red-50 py-2"
                >
                  <AlertDescription className="text-xs font-medium text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[13px] font-bold text-slate-700">
                      Tên đăng nhập
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên đăng nhập"
                        className="h-10 border-slate-200 bg-white text-[14px] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-400"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[13px] font-bold text-slate-700">
                      Mật khẩu
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          className="h-10 border-slate-200 bg-white pr-10 text-[14px] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-400"
                          disabled={isLoading}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
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
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                {/* Button: Chuyển sang màu Navy đen cực đậm (#0f172a) */}
                <Button
                  type="submit"
                  className="h-10 w-full bg-[#0f172a] text-[14px] font-medium text-white transition-all hover:bg-[#1e293b] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng nhập...
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

      {/* Footer: Text mờ phía dưới chân trang */}
      <div className="absolute bottom-6 w-full text-center text-[11px] text-slate-400">
        <p>© 2025 Lab Platform. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginPage;
