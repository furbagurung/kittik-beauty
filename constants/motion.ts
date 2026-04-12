import { Easing } from "react-native-reanimated";

export const motionDurations = {
  pressIn: 110,
  pressOut: 170,
  standard: 240,
  entrance: 420,
} as const;

export const motionEasing = {
  standard: Easing.bezier(0.22, 1, 0.36, 1),
} as const;

export const pressScale = {
  default: 0.985,
  subtle: 0.992,
} as const;

export const pressInTiming = {
  duration: motionDurations.pressIn,
  easing: motionEasing.standard,
} as const;

export const pressOutTiming = {
  duration: motionDurations.pressOut,
  easing: motionEasing.standard,
} as const;

export const createEntranceTransition = (delay = 0) => ({
  type: "timing" as const,
  duration: motionDurations.entrance,
  delay,
  easing: motionEasing.standard,
});
