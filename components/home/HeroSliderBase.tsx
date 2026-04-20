import Carousel from "react-native-reanimated-carousel";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import HeroSlideCard from "./HeroSlideCard";
import { HERO_HEIGHT, HERO_SLIDES } from "./heroSlides";

export default function HeroSliderBase() {
  const { width } = useWindowDimensions();

  if (!width) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Carousel
        loop
        autoPlay
        pagingEnabled
        snapEnabled
        overscrollEnabled={false}
        autoPlayInterval={4000}
        width={width}
        height={HERO_HEIGHT}
        data={HERO_SLIDES}
        renderItem={({ item }) => <HeroSlideCard slide={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    height: HERO_HEIGHT,
  },
});
