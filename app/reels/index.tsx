import ReelPlayerCard from "@/components/reels/ReelPlayerCard";
import { api, type Reel, type ReelProductTag } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import {
  FlashList,
  type ListRenderItemInfo,
  type ViewToken,
} from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

const INITIAL_SCREEN_HEIGHT = Dimensions.get("window").height;
const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 85,
  minimumViewTime: 80,
};

export default function ReelsScreen() {
  const screenFocused = useIsFocused();
  const tabBarHeight = useBottomTabBarHeight();
  const token = useAuthStore((state) => state.token);
  const [activeReelId, setActiveReelId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);
  const [screenHeight, setScreenHeight] = useState(INITIAL_SCREEN_HEIGHT);
  const viewedReelIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenHeight(Math.max(1, window.height));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadReels = useCallback(
    async (refreshing = false) => {
      try {
        if (refreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError("");
        const data = await api.getReels(token);
        setReels(data);
        setActiveReelId((current) =>
          data.some((reel) => reel.id === current)
            ? current
            : (data[0]?.id ?? null),
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load reels",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadReels();
  }, [loadReels]);

  useEffect(() => {
    if (!activeReelId || viewedReelIds.current.has(activeReelId)) return;

    viewedReelIds.current.add(activeReelId);

    void api
      .trackReelView(
        activeReelId,
        { watchedSeconds: 0, completed: false },
        token,
      )
      .then((result) => {
        setReels((current) =>
          current.map((reel) =>
            reel.id === activeReelId
              ? { ...reel, viewCount: result.viewCount }
              : reel,
          ),
        );
      })
      .catch(() => {
        viewedReelIds.current.delete(activeReelId);
      });
  }, [activeReelId, token]);
  useEffect(() => {
    if (!activeReelId) return;

    const currentIndex = reels.findIndex((item) => item.id === activeReelId);
    if (currentIndex === -1) return;

    const nextReel = reels[currentIndex + 1];
    if (nextReel?.thumbnailUrl) {
      void Image.prefetch(nextReel.thumbnailUrl);
    }
  }, [activeReelId, reels]);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Reel>[] }) => {
      const firstVisible = viewableItems.find(
        (item) => item.isViewable && typeof item.item?.id === "number",
      );

      if (firstVisible?.item?.id != null) {
        setActiveReelId(firstVisible.item.id);
      }
    },
  );

  const listExtraData = useMemo(
    () => ({
      activeReelId,
      isMuted,
      screenFocused,
      screenHeight,
      tabBarHeight,
    }),
    [activeReelId, isMuted, screenFocused, screenHeight, tabBarHeight],
  );

  const keyExtractor = useCallback((item: Reel) => String(item.id), []);

  const requireLogin = useCallback(() => {
    router.push("/login");
  }, []);

  const handleLike = useCallback(
    async (reel: Reel) => {
      if (!token) {
        requireLogin();
        return;
      }

      await Haptics.selectionAsync();
      const nextLiked = !reel.likedByMe;
      const nextLikeCount = Math.max(0, reel.likeCount + (nextLiked ? 1 : -1));

      setReels((current) =>
        current.map((item) =>
          item.id === reel.id
            ? { ...item, likedByMe: nextLiked, likeCount: nextLikeCount }
            : item,
        ),
      );

      try {
        const result = nextLiked
          ? await api.likeReel(reel.id, token)
          : await api.unlikeReel(reel.id, token);

        setReels((current) =>
          current.map((item) =>
            item.id === reel.id
              ? {
                  ...item,
                  likedByMe: result.likedByMe,
                  likeCount: result.likeCount,
                }
              : item,
          ),
        );
      } catch {
        setReels((current) =>
          current.map((item) =>
            item.id === reel.id
              ? {
                  ...item,
                  likedByMe: reel.likedByMe,
                  likeCount: reel.likeCount,
                }
              : item,
          ),
        );
      }
    },
    [requireLogin, token],
  );

  const handleSave = useCallback(
    async (reel: Reel) => {
      if (!token) {
        requireLogin();
        return;
      }

      await Haptics.selectionAsync();
      const nextSaved = !reel.savedByMe;
      const nextSaveCount = Math.max(0, reel.saveCount + (nextSaved ? 1 : -1));

      setReels((current) =>
        current.map((item) =>
          item.id === reel.id
            ? { ...item, savedByMe: nextSaved, saveCount: nextSaveCount }
            : item,
        ),
      );

      try {
        const result = nextSaved
          ? await api.saveReel(reel.id, token)
          : await api.unsaveReel(reel.id, token);

        setReels((current) =>
          current.map((item) =>
            item.id === reel.id
              ? {
                  ...item,
                  savedByMe: result.savedByMe,
                  saveCount: result.saveCount,
                }
              : item,
          ),
        );
      } catch {
        setReels((current) =>
          current.map((item) =>
            item.id === reel.id
              ? {
                  ...item,
                  savedByMe: reel.savedByMe,
                  saveCount: reel.saveCount,
                }
              : item,
          ),
        );
      }
    },
    [requireLogin, token],
  );

  const handleShare = useCallback(
    async (reel: Reel) => {
      const product = reel.productTags[0]?.product;
      const suffix = product ? `\nShop: ${product.name}` : "";

      await Share.share({
        message: `${reel.title}${suffix}`,
        title: reel.title,
      });

      try {
        const result = await api.trackReelShare(reel.id, token);
        setReels((current) =>
          current.map((item) =>
            item.id === reel.id
              ? { ...item, shareCount: result.shareCount }
              : item,
          ),
        );
      } catch {
        // Sharing should not fail the user action if analytics is unavailable.
      }
    },
    [token],
  );

  const handleMuteToggle = useCallback(() => {
    setIsMuted((current) => !current);
  }, []);

  const handleShop = useCallback(
    async (reel: Reel, tag: ReelProductTag) => {
      await Haptics.selectionAsync();

      try {
        const result = await api.trackReelProductClick(
          reel.id,
          {
            productId: tag.productId,
            variantId: tag.variantId,
            reelProductTagId: tag.id,
            source: "reel-product-card",
          },
          token,
        );
        setReels((current) =>
          current.map((item) =>
            item.id === reel.id
              ? { ...item, productClickCount: result.productClickCount }
              : item,
          ),
        );
      } catch {
        // Navigation should remain responsive even if analytics is unavailable.
      }

      router.push({
        pathname: "/product/[id]",
        params: { id: String(tag.productId) },
      });
    },
    [token],
  );

  const renderItem = useCallback(
    ({ item, target }: ListRenderItemInfo<Reel>) => {
      if (target !== "Cell") {
        return <View style={[styles.reelPage, { height: screenHeight }]} />;
      }

      const activeIndex = reels.findIndex((reel) => reel.id === activeReelId);
      const currentIndex = reels.findIndex((reel) => reel.id === item.id);

      return (
        <View style={[styles.reelPage, { height: screenHeight }]}>
          <ReelPlayerCard
            bottomInset={tabBarHeight}
            height={screenHeight}
            isActive={item.id === activeReelId}
            isMuted={isMuted}
            preload={currentIndex === activeIndex + 1}
            onLike={handleLike}
            onMuteToggle={handleMuteToggle}
            onSave={handleSave}
            onShare={handleShare}
            onShop={handleShop}
            reel={item}
            screenFocused={screenFocused}
          />
        </View>
      );
    },
    [
      activeReelId,
      handleLike,
      handleSave,
      handleShare,
      handleShop,
      handleMuteToggle,
      isMuted,
      reels,
      screenFocused,
      screenHeight,
      tabBarHeight,
    ],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#ffffff" />
        <Text style={styles.loadingText}>Loading reels...</Text>
      </View>
    );
  }

  if (error && reels.length === 0) {
    return (
      <View style={styles.emptyScreen}>
        <Ionicons name="film-outline" size={36} color="#ffffff" />
        <Text style={styles.emptyTitle}>Reels are unavailable</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void loadReels()}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={styles.emptyScreen}>
        <Ionicons name="sparkles-outline" size={36} color="#ffffff" />
        <Text style={styles.emptyTitle}>No reels yet</Text>
        <Text style={styles.emptyText}>
          New shoppable videos will appear here when they are published.
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <FlashList<Reel>
        data={reels}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={VIEWABILITY_CONFIG}
        refreshing={isRefreshing}
        onRefresh={() => void loadReels(true)}
        removeClippedSubviews
        drawDistance={screenHeight * 2}
        extraData={listExtraData}
        style={styles.feed}
      />
    </>
  );
}

const styles = StyleSheet.create({
  emptyScreen: {
    flex: 1,
    backgroundColor: "#050505",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  feed: {
    flex: 1,
    backgroundColor: "#050505",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#050505",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 0,
  },
  reelPage: {
    backgroundColor: "#050505",
    overflow: "hidden",
  },
  retryButton: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
});
