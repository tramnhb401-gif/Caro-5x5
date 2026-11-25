import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLeaderboard } from '../hooks/useLeaderboard';

export function LeaderboardScreen() {
  const router = useRouter();
  const { rankedPlayers, isLoading } = useLeaderboard();

  return (
    <View className="flex-1 bg-surface-bg px-5 pt-14">
      <View className="mb-5 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-xl bg-white px-4 py-2 shadow-sm"
        >
          <Text className="font-semibold text-slate-700">← Quay lại</Text>
        </TouchableOpacity>

        <Text className="text-xl font-extrabold text-slate-900">
          Bảng xếp hạng
        </Text>

        <View className="w-20" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm font-medium text-slate-500">
            Đang tải bảng xếp hạng...
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="gap-3 pb-10">
            {rankedPlayers.map((player, index) => {
              const rank = index + 1;
              const rankStyle =
                rank === 1
                  ? 'bg-amber-400 text-white'
                  : rank === 2
                    ? 'bg-slate-400 text-white'
                    : rank === 3
                      ? 'bg-orange-400 text-white'
                      : 'bg-slate-100 text-slate-600';

              return (
                <View
                  key={player.id}
                  className={`flex-row items-center justify-between rounded-2xl p-4 shadow-sm ${
                    player.isCurrentUser
                      ? 'border-2 border-brand-500 bg-brand-50'
                      : 'bg-white'
                  }`}
                >
                  <View className="flex-row items-center gap-3.5">
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${rankStyle}`}
                    >
                      <Text className="text-sm font-extrabold">{rank}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-bold text-slate-900">
                        {player.username}
                      </Text>
                      <Text className="text-xs text-slate-500">
                        {player.wins} Thắng • {player.losses} Thua
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-lg font-extrabold text-brand-700">
                      {player.elo}
                    </Text>
                    <Text className="text-[11px] font-semibold uppercase text-slate-400">
                      Elo
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
