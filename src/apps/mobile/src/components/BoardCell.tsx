import React, { useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CellValue } from '@caro/shared';

interface BoardCellProps {
  value: CellValue;
  isWinningCell?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function BoardCell({
  value,
  isWinningCell = false,
  disabled = false,
  onPress,
}: BoardCellProps) {
  const scale = useSharedValue(value ? 1 : 0.4);

  useEffect(() => {
    if (value) {
      scale.value = 0.4;
      scale.value = withSpring(1, { damping: 14, stiffness: 220 });
    } else {
      scale.value = 0.4;
    }
  }, [value, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgClass = isWinningCell ? 'bg-amber-200' : 'bg-white';
  const textColorClass = value === 'X' ? 'text-rose-600' : 'text-blue-600';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={`h-16 w-16 items-center justify-center border border-slate-300 ${bgClass}`}
    >
      {value && (
        <Animated.View style={animatedStyle}>
          <Text className={`text-4xl font-black leading-none ${textColorClass}`}>
            {value}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}