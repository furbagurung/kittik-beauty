import { Image, StyleSheet, View } from "react-native";

import type { HeroSlide } from "./heroSlides";

type HeroSlideCardProps = {
  slide: HeroSlide;
};

export default function HeroSlideCard({ slide }: HeroSlideCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: slide.image }} resizeMode="cover" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#111827",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
