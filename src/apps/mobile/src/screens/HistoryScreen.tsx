import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useHistory } from '../hooks/useHistory';

export function HistoryScreen() {
  const router = useRouter();
  const { matches, clearHistory } = useHistory();

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
          Lịch sử đấu
        </Text>

        <TouchableOpacity
          onPress={clearHistory}
          disabled={matches.length === 0}
          className="rounded-xl px-3 py-2"
        >
          <Text
            className={`text-sm font-semibold ${
              matches.length === 0 ? 'text-slate-300' : 'text-rose-500'
            }`}
          >
            Xóa hết
          </Text>
        </TouchableOpacity>
      </View>

      {matches.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base font-medium text-slate-400">
            Chưa có ván đấu nào được lưu.
          </Text>
          <Text className="mt-1 text-sm text-slate-400">
            Hãy chơi xong 1 ván để xem lịch sử tại đây!
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="gap-3 pb-10">
            {matches.map((item) => {
              const isDraw = item.winner === 'DRAW';
              const isPlayerWin = item.mode === 'PVE' && item.winner === 'X';
              const badgeClass = isDraw
                ? 'bg-amber-100 text-amber-700'
                : isPlayerWin || item.mode === 'PVP_LOCAL'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700';

              const resultText = isDraw
                ? 'Hòa cờ'
                : item.mode === 'PVE'
                  ? item.winner === 'X'
                    ? 'Bạn thắng'
                    : 'AI thắng'
                  : `${item.winner} thắng`;

              return (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                >
                  <View>
                    <Text className="text-base font-bold text-slate-900">
                      {item.mode === 'PVE'
                        ? `Đấu với AI (${item.difficulty})`
                        : 'Chơi 2 người'}
                    </Text>
                    <Text className="mt-0.5 text-xs text-slate-500">
                      {item.totalMoves} nước đi •{' '}
                      {new Date(item.playedAt).toLocaleTimeString('vi-VN')}
                    </Text>
                  </View>

                  <Text
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${badgeClass}`}
                  >
                    {resultText}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
