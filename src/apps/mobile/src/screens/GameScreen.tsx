import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BoardCell } from '../components/BoardCell';
import { useGame } from '../hooks/useGame';

export function GameScreen() {
  const router = useRouter();

  const {
    board,
    currentTurn,
    mode,
    difficulty,
    isAiThinking,
    result,
    makeMove,
    resetGame,
  } = useGame();

  const isGameOver = result.status !== 'PLAYING';

  const turnBadgeStyle =
    currentTurn === 'X'
      ? 'bg-rose-100 text-rose-600'
      : 'bg-blue-100 text-blue-600';

  const modeLabel =
    mode === 'PVE' ? `Đấu với AI (${difficulty})` : 'Chơi 2 người';

  return (
    <View className="flex-1 items-center justify-center bg-slate-100 px-4">
      <Text className="text-3xl font-bold tracking-tight text-slate-900">
        Caro 5x5
      </Text>
      <Text className="mb-4 mt-1 text-sm font-medium text-slate-500">
        {modeLabel}
      </Text>

      {result.status === 'WIN' ? (
        <View className="mb-6 rounded-full bg-emerald-100 px-5 py-2 shadow-sm">
          <Text className="text-base font-bold text-emerald-700">
            {mode === 'PVE' && result.winner === 'O'
              ? 'AI đã chiến thắng!'
              : `Người chơi ${result.winner} chiến thắng!`}
          </Text>
        </View>
      ) : result.status === 'DRAW' ? (
        <View className="mb-6 rounded-full bg-amber-100 px-5 py-2 shadow-sm">
          <Text className="text-base font-bold text-amber-700">
            Hòa cờ! Không còn ô trống
          </Text>
        </View>
      ) : isAiThinking ? (
        <View className="mb-6 rounded-full bg-blue-100 px-5 py-2 shadow-sm">
          <Text className="text-base font-bold text-blue-700">
            AI đang suy nghĩ...
          </Text>
        </View>
      ) : (
        <View className="mb-6 flex-row items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
          <Text className="text-base font-medium text-slate-600">
            Lượt hiện tại:
          </Text>
          <Text
            className={`rounded-md px-2.5 py-0.5 text-base font-bold ${turnBadgeStyle}`}
          >
            {currentTurn}
          </Text>
        </View>
      )}

      <View
        className={`overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md ${
          isAiThinking ? 'opacity-80' : 'opacity-100'
        }`}
      >
        <View className="w-[320px] flex-row flex-wrap">
          {board.map((cell, index) => (
            <BoardCell
              key={index}
              value={cell}
              disabled={isGameOver || isAiThinking || cell !== null}
              isWinningCell={result.winningLine.includes(index)}
              onPress={() => void makeMove(index)}
            />
          ))}
        </View>
      </View>

      <View className="mt-7 flex-row gap-3">
        <TouchableOpacity
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 shadow-sm"
        >
          <Text className="text-base font-semibold text-slate-700">
            Trang chủ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetGame}
          activeOpacity={0.8}
          className="rounded-xl bg-slate-900 px-7 py-3.5 shadow-sm"
        >
          <Text className="text-base font-semibold text-white">
            {isGameOver ? 'Ván mới' : 'Chơi lại'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
