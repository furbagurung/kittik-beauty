import { pressInTiming, pressOutTiming, pressScale } from "@/constants/motion";
import type { ComponentProps, ReactNode } from "react";
import { Pressable as GesturePressable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable =
  Animated.createAnimatedComponent(GesturePressable);

type ScalePressableProps = ComponentProps<typeof GesturePressable> & {
  children: ReactNode;
  scaleTo?: number;
};

export default function ScalePressable({
  children,
  disabled,
  onPressIn,
  onPressOut,
  scaleTo = pressScale.default,
  style,
  ...props
}: ScalePressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        scale.value = withTiming(disabled ? 1 : scaleTo, pressInTiming);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, pressOutTiming);
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
