import { Skeleton as MotiSkeleton } from "moti/skeleton";
import { DimensionValue, View, ViewStyle } from "react-native";

type Props = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export default function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: Props) {
  return (
    <View style={style}>
      <MotiSkeleton
        width={width as any}
        height={height}
        radius={radius}
        colorMode="light"
      />
    </View>
  );
}
