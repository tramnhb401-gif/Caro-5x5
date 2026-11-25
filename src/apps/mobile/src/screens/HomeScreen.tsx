import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AiDifficulty } from '@caro/shared';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../hooks/useAuth';

const DIFFICULTIES: { value: AiDifficulty; label: string }[] = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó' },
];

export function HomeScreen() {
  const router = useRouter();
  const { startNewGame } = useGame();
  const { user, logout } = useAuth();

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<AiDifficulty>('medium');

  const handlePlayAI = () => {
    startNewGame('PVE', selectedDifficulty);
    router.push('/game');
  };

  const handlePlayLocal = () => {
    startNewGame('PVP_LOCAL');
    router.push('/game');
  };

  return (
    <View className="flex-1 items-center justify-center bg-surface-bg px-6">
      {user && (
        <View className="mb-8 w-full max-w-xs flex-row items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <View>
            <Text className="text-base font-bold text-slate-900">
              {user.username}
            </Text>
            <Text className="text-xs font-semibold text-brand-600">
              Elo: {user.elo} • {user.wins}W / {user.losses}L
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              void logout().then(() => router.replace('/login'));
            }}
            className="rounded-lg bg-slate-100 px-3 py-1.5"
          >
            <Text className="text-xs font-semibold text-slate-600">
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mb-7 items-center">
        <Text className="text-4xl font-extrabold tracking-tight text-slate-900">
          Caro 5x5
        </Text>
        <Text className="mt-1.5 text-sm text-slate-500">
          4 quân liên tiếp để chiến thắng
        </Text>
      </View>

      <View className="mb-5 w-full max-w-xs rounded-2xl bg-white p-4 shadow-sm">
        <Text className="mb-3 text-center text-sm font-semibold text-slate-600">
          Độ khó AI
        </Text>
        <View className="flex-row justify-between gap-2">
          {DIFFICULTIES.map((item) => {
            const isActive = selectedDifficulty === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setSelectedDifficulty(item.value)}
                activeOpacity={0.7}
                className={`flex-1 items-center rounded-xl py-2.5 ${
                  isActive ? 'bg-surface-dark' : 'bg-slate-100'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="w-full max-w-xs gap-3">
        <TouchableOpacity
          onPress={handlePlayAI}
          activeOpacity={0.85}
          className="items-center rounded-2xl bg-brand-600 py-4 shadow-sm"
        >
          <Text className="text-lg font-bold text-white">Đấu với AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePlayLocal}
          activeOpacity={0.85}
          className="items-center rounded-2xl border border-slate-300 bg-white py-4 shadow-sm"
        >
          <Text className="text-lg font-bold text-slate-800">
            Chơi 2 người (Cùng máy)
          </Text>
        </TouchableOpacity>

        <View className="mt-1 flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push('/leaderboard')}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-2xl bg-white py-3.5 shadow-sm"
          >
            <Text className="text-sm font-bold text-slate-700">
              Bảng xếp hạng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/history')}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-2xl bg-white py-3.5 shadow-sm"
          >
            <Text className="text-sm font-bold text-slate-700">
              Lịch sử đấu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
