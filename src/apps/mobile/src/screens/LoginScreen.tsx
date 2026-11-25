import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import {
  AuthFormValues,
  loginSchema,
  registerSchema,
} from '../schemas/auth.schema';

export function LoginScreen() {
  const { login, register, isSubmitting } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(isRegisterMode ? registerSchema : loginSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AuthFormValues) => {
    const err = isRegisterMode
      ? await register(data.username ?? '', data.email, data.password)
      : await login(data.email, data.password);
    setServerError(err);
  };

  const handleToggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    setServerError(null);
    reset();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 items-center justify-center bg-surface-bg px-6"
    >
      <View className="w-full max-w-sm rounded-3xl bg-surface-card p-6 shadow-md">
        <Text className="text-center text-3xl font-extrabold text-slate-900">
          Caro 5x5
        </Text>
        <Text className="mb-6 mt-1 text-center text-sm text-slate-500">
          {isRegisterMode
            ? 'Tạo tài khoản mới để lưu Elo'
            : 'Đăng nhập để tiếp tục'}
        </Text>

        {isRegisterMode && (
          <View className="mb-3.5">
            <Text className="mb-1.5 text-xs font-semibold uppercase text-slate-500">
              Tên người chơi
            </Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Ví dụ: CaroMaster"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
                />
              )}
            />
            {errors.username && (
              <Text className="mt-1 text-xs font-medium text-rose-500">
                {errors.username.message}
              </Text>
            )}
          </View>
        )}

        <View className="mb-3.5">
          <Text className="mb-1.5 text-xs font-semibold uppercase text-slate-500">
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
              />
            )}
          />
          {errors.email && (
            <Text className="mt-1 text-xs font-medium text-rose-500">
              {errors.email.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="mb-1.5 text-xs font-semibold uppercase text-slate-500">
            Mật khẩu
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Tối thiểu 4 ký tự"
                secureTextEntry
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
              />
            )}
          />
          {errors.password && (
            <Text className="mt-1 text-xs font-medium text-rose-500">
              {errors.password.message}
            </Text>
          )}
        </View>

        {serverError && (
          <View className="mb-4 rounded-xl bg-rose-50 px-3.5 py-2.5">
            <Text className="text-sm font-medium text-rose-600">
              {serverError}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={isSubmitting}
          activeOpacity={0.85}
          className={`items-center rounded-xl py-3.5 shadow-sm ${
            isSubmitting ? 'bg-brand-500 opacity-70' : 'bg-brand-600'
          }`}
        >
          <Text className="text-base font-bold text-white">
            {isRegisterMode ? 'Đăng ký' : 'Đăng nhập'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleToggleMode}
          className="mt-4 items-center py-2"
        >
          <Text className="text-sm font-medium text-brand-600">
            {isRegisterMode
              ? 'Đã có tài khoản? Đăng nhập'
              : 'Chưa có tài khoản? Đăng ký ngay'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
