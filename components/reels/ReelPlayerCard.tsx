import type { Reel, ReelProductTag } from "@/services/api";
import { getProductCategoryName } from "@/utils/productCategory";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import { memo, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

export type ReelPlayerCardProps = {
  bottomInset: number;
  height: number;
  isActive: boolean;
  isMuted: boolean;
  preload?: boolean;
  reel: Reel;
  screenFocused: boolean;
  onLike: (reel: Reel) => void;
  onMuteToggle: () => void;
  onSave: (reel: Reel) => void;
  onShare: (reel: Reel) => void;
  onShop: (reel: Reel, tag: ReelProductTag) => void;
};

function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ReelPlayerCard({
  bottomInset,
  height,
  isActive,
  isMuted,
  onLike,
  onMuteToggle,
  onSave,
  onShare,
  onShop,
  preload = false,
  reel,
  screenFocused,
}: ReelPlayerCardProps) {
  const [pausedByUser, setPausedByUser] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const lastTapRef = useRef(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const heartScale = useRef(new Animated.Value(0.4)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  const shouldPlay = isActive && screenFocused && !pausedByUser;
  const featuredTag = reel.productTags[0];
  const posterSource: ImageSourcePropType | undefined = reel.thumbnailUrl
    ? { uri: reel.thumbnailUrl }
    : undefined;

  const player = useVideoPlayer(reel.videoUrl, (player) => {
    player.loop = true;
    player.muted = isMuted;
  });

  useEffect(() => {
    setPausedByUser(false);
    setProgress(0);
    setBufferedProgress(0);
  }, [reel.id]);

  useEffect(() => {
    if (!isActive) {
      setPausedByUser(false);
      setProgress(0);
      setBufferedProgress(0);
    }
  }, [isActive]);

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, shouldPlay]);

  useEffect(() => {
    if (!preload) return;

    try {
      player.pause();
    } catch {}
  }, [player, preload]);

  useEffect(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    if (!shouldPlay) return;

    progressTimerRef.current = setInterval(() => {
      const duration = player.duration ?? 0;
      const currentTime = player.currentTime ?? 0;
      const bufferedTime = (player as any).bufferedPosition ?? currentTime;

      if (duration > 0) {
        setProgress(Math.max(0, Math.min(1, currentTime / duration)));
        setBufferedProgress(Math.max(0, Math.min(1, bufferedTime / duration)));
      } else {
        setProgress(0);
        setBufferedProgress(0);
      }
    }, 140);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [player, shouldPlay]);

  const progressWidth = `${progress * 100}%` as `${number}%`;
  const bufferedWidth = `${bufferedProgress * 100}%` as `${number}%`;

  function animateHeartBurst() {
    setShowHeartBurst(true);
    heartScale.setValue(0.4);
    heartOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }),
      Animated.sequence([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 280,
          delay: 280,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowHeartBurst(false);
    });
  }

  function togglePlayback() {
    if (!isActive) return;
    setPausedByUser((current) => !current);
  }

  function handleVideoTap() {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 260;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      lastTapRef.current = 0;

      if (!reel.likedByMe) {
        void onLike(reel);
      }

      animateHeartBurst();
      return;
    }

    lastTapRef.current = now;
    setTimeout(() => {
      if (Date.now() - now >= DOUBLE_TAP_DELAY && lastTapRef.current === now) {
        togglePlayback();
      }
    }, DOUBLE_TAP_DELAY);
  }

  return (
    <View style={[styles.card, { height }]}>
      <View
        style={[
          styles.progressTrack,
          { bottom: Math.max(bottomInset + 2, 2) },
        ]}
      >
        <View style={styles.progressBase} />
        <View style={[styles.progressBuffered, { width: bufferedWidth }]} />
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <Pressable style={styles.videoLayer} onPress={handleVideoTap}>
        {posterSource ? (
          <Image source={posterSource} style={styles.posterImage} />
        ) : null}

        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          surfaceType="textureView"
        />

        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0.06)",
            "rgba(0,0,0,0.16)",
            "rgba(0,0,0,0.34)",
            "rgba(0,0,0,0.58)",
          ]}
          locations={[0, 0.42, 0.62, 0.8, 1]}
          style={styles.bottomGradient}
        />

        {pausedByUser ? (
          <View style={styles.pauseBadge}>
            <Ionicons name="play" size={34} color="#ffffff" />
          </View>
        ) : null}

        {showHeartBurst ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heartBurst,
              {
                opacity: heartOpacity,
                transform: [{ scale: heartScale }],
              },
            ]}
          >
            <Ionicons name="heart" size={92} color="#ffffff" />
          </Animated.View>
        ) : null}
      </Pressable>

      <View pointerEvents="box-none" style={styles.topOverlay}>
        <Text style={styles.screenTitle}>Reels</Text>
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.actionRail, { bottom: bottomInset + 104 }]}
      >
        <Pressable style={styles.actionButton} onPress={() => onLike(reel)}>
          <Ionicons
            name={reel.likedByMe ? "heart" : "heart-outline"}
            size={30}
            color={reel.likedByMe ? "#f43f5e" : "#ffffff"}
          />
          <Text style={styles.actionText}>{formatCount(reel.likeCount)}</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => onSave(reel)}>
          <Ionicons
            name={reel.savedByMe ? "bookmark" : "bookmark-outline"}
            size={28}
            color="#ffffff"
          />
          <Text style={styles.actionText}>{formatCount(reel.saveCount)}</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => onShare(reel)}>
          <Ionicons name="share-social-outline" size={28} color="#ffffff" />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.bottomOverlay, { bottom: bottomInset + 24 }]}
      >
        <Text style={styles.captionTitle} numberOfLines={1}>
          {reel.title || reel.creatorName || "Reel"}
        </Text>

        {!!reel.caption && reel.caption !== reel.title && (
          <Text style={styles.caption} numberOfLines={2}>
            {reel.caption}
          </Text>
        )}

        {featuredTag ? (
          <Pressable
            style={styles.productCard}
            onPress={() => onShop(reel, featuredTag)}
          >
            {featuredTag.product.image ? (
              <Image
                source={{ uri: featuredTag.product.image }}
                style={styles.productImage}
              />
            ) : (
              <View style={styles.productImageFallback}>
                <Ionicons name="sparkles-outline" size={18} color="#DC2626" />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {featuredTag.product.name}
              </Text>
              <Text style={styles.productMeta} numberOfLines={1}>
                {getProductCategoryName(featuredTag.product.category)} /{" "}
                {formatPrice(featuredTag.product.price)}
              </Text>
            </View>
            <View style={styles.shopButton}>
              <Text style={styles.shopButtonText}>
                {featuredTag.ctaLabel || "Shop now"}
              </Text>
            </View>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        style={[styles.muteButtonFloating, { bottom: bottomInset + 20 }]}
        onPress={onMuteToggle}
      >
        <View style={styles.iconButton}>
          <Ionicons
            name={isMuted ? "volume-mute" : "volume-high"}
            size={21}
            color="#ffffff"
          />
        </View>
      </Pressable>
    </View>
  );
}

export default memo(ReelPlayerCard);

const styles = StyleSheet.create({
  muteButtonFloating: {
    position: "absolute",
    right: 14,
    zIndex: 22,
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
    minHeight: 52,
    width: 48,
  },
  actionRail: {
    position: "absolute",
    right: 14,
    gap: 20,
    alignItems: "center",
    zIndex: 20,
  },
  actionText: {
    color: "rgba(255,255,255,0.96)",
    fontSize: 11,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.42)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
    zIndex: 8,
  },
  bottomOverlay: {
    position: "absolute",
    left: 16,
    right: 84,
    gap: 12,
    zIndex: 18,
  },
  captionTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  caption: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  card: {
    backgroundColor: "#000000",
    overflow: "hidden",
    position: "relative",
  },
  heartBurst: {
    position: "absolute",
    left: "50%",
    top: "42%",
    marginLeft: -46,
    marginTop: -46,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15,23,42,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pauseBadge: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 74,
    height: 74,
    marginLeft: -37,
    marginTop: -37,
    borderRadius: 37,
    backgroundColor: "rgba(0,0,0,0.36)",
    alignItems: "center",
    justifyContent: "center",
  },
  posterImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  productCard: {
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
  },
  productImageFallback: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
  },
  productMeta: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  productName: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
  progressTrack: {
    position: "absolute",
    left: 14,
    right: 14,
    height: 4,
    borderRadius: 999,
    overflow: "hidden",
    zIndex: 30,
    backgroundColor: "transparent",
  },
  progressBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  progressBuffered: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: "#FE2C55",
    shadowColor: "#FE2C55",
    shadowOpacity: 0.32,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  screenTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.48)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  shopButton: {
    borderRadius: 999,
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  shopButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  topOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  videoLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
});
