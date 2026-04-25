import Skeleton from "@/components/ui/Skeleton";
import { api } from "@/services/api";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Product } from "@/types/product";
import { getProductCategoryName } from "@/utils/productCategory";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Carousel, {
  type ICarouselInstance,
} from "react-native-reanimated-carousel";
export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const addToCart = useCartStore((state) => state.addToCart);
  const items = useCartStore((state) => state.items);

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items);
  const mainCarouselRef = useRef<ICarouselInstance>(null);
  const fullscreenCarouselRef = useRef<ICarouselInstance>(null);

  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {},
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const currentProductId = product ? String(product.id) : "";
  const currentCategory = getProductCategoryName(product?.category, "");
  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;

    return (
      product.variants.find((variant) =>
        variant.selectedOptions.every(
          (selection) =>
            selectedOptions[selection.optionName] === selection.value,
        ),
      ) ??
      product.variants.find((variant) => variant.isDefault) ??
      product.variants[0]
    );
  }, [product?.variants, selectedOptions]);
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const displayImage = selectedVariant?.image || product?.image;
  const isInStock =
    typeof displayStock === "number" ? displayStock > 0 : true;

  const stockText = isInStock ? "In Stock" : "Out of Stock";

  const ratingValue =
    typeof product?.rating === "number" ? product.rating.toFixed(1) : "4.8";

  const totalPrice = product ? displayPrice * qty : 0;

  const descriptionText =
    product?.description?.trim() ||
    "A premium beauty essential crafted for everyday confidence, smooth application, and a polished self-care routine.";

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const rawImages = [displayImage, product.image, ...(product.images ?? [])];
    return Array.from(
      new Set(rawImages.filter((item): item is string => Boolean(item))),
    );
  }, [displayImage, product]);

  const galleryData =
    galleryImages.length > 0
      ? galleryImages
      : displayImage
        ? [displayImage]
        : [];

  useEffect(() => {
    setQty(1);
    const defaults: Record<string, string> = {};
    const defaultVariant =
      product?.variants?.find((variant) => variant.isDefault) ??
      product?.variants?.[0];

    for (const selection of defaultVariant?.selectedOptions ?? []) {
      defaults[selection.optionName] = selection.value;
    }

    setSelectedOptions(defaults);
    setIsAdded(false);
    setShowAddedMessage(false);
    setCurrentImageIndex(0);
    setFullscreenIndex(0);
    setIsGalleryOpen(false);
    setLoadedImages({});
  }, [product?.id, product?.variants]);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;

      try {
        setLoading(true);

        const data = await api.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.log("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);
  useEffect(() => {
    let isMounted = true;

    async function loadRelatedProducts() {
      if (!currentProductId) {
        if (isMounted) setRelatedProducts([]);
        return;
      }

      try {
        const allProducts: Product[] = currentCategory
          ? await api.getProducts({ category: currentCategory })
          : await api.getProducts();

        const filtered = allProducts
          .filter((item) => String(item.id) !== currentProductId)
          .slice(0, 8);

        if (isMounted) {
          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.log("Error loading related products:", error);

        if (isMounted) {
          setRelatedProducts([]);
        }
      }
    }

    loadRelatedProducts();

    return () => {
      isMounted = false;
    };
  }, [currentProductId, currentCategory]);
  const liked = product
    ? wishlistItems.some((item) => String(item.id) === String(product.id))
    : false;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    if (!showAddedMessage) return;

    const timer = setTimeout(() => {
      setShowAddedMessage(false);
      setIsAdded(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, [showAddedMessage]);

  useEffect(() => {
    if (!product) return;

    if (typeof displayStock === "number") {
      if (displayStock <= 0) {
        setQty(1);
        return;
      }

      if (qty > displayStock) {
        setQty(displayStock);
      }
    }
  }, [displayStock, qty, product]);
  const handleDecreaseQty = async () => {
    if (qty === 1) return;
    await Haptics.selectionAsync();
    setQty((prev) => Math.max(1, prev - 1));
  };

  const maxAvailableQty =
    typeof displayStock === "number" && displayStock > 0 ? displayStock : 1;

  const handleIncreaseQty = async () => {
    if (!isInStock) return;
    if (qty >= maxAvailableQty) return;

    await Haptics.selectionAsync();
    setQty((prev) => Math.min(maxAvailableQty, prev + 1));
  };
  const handleAddToCart = async () => {
    if (!product || !isInStock) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    addToCart({
      id: String(selectedVariant?.id ?? product.id),
      productId: String(product.id),
      variantId: selectedVariant?.id ? String(selectedVariant.id) : undefined,
      variantTitle: selectedVariant?.title,
      selectedOptions: selectedVariant?.selectedOptions ?? [],
      name: product.name,
      price: displayPrice,
      image: displayImage ?? "",
      quantity: qty,
      stock: displayStock ?? 0,
    });
    setIsAdded(true);
    setShowAddedMessage(true);
  };

  const handleBuyNow = async () => {
    if (!product || !isInStock) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    addToCart({
      id: String(selectedVariant?.id ?? product.id),
      productId: String(product.id),
      variantId: selectedVariant?.id ? String(selectedVariant.id) : undefined,
      variantTitle: selectedVariant?.title,
      selectedOptions: selectedVariant?.selectedOptions ?? [],
      name: product.name,
      price: displayPrice,
      image: displayImage ?? "",
      quantity: qty,
      stock: displayStock ?? 0,
    });
    router.push("/checkout");
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    await Haptics.selectionAsync();

    toggleWishlist({
      id: String(product.id),
      name: product.name,
      price: displayPrice,
      image: displayImage ?? "",
      category: getProductCategoryName(product.category),
      rating: product.rating ?? 4.8,
    });
  };

  const handleBackPress = async () => {
    await Haptics.selectionAsync();
    router.back();
  };

  const handleCartPress = async () => {
    await Haptics.selectionAsync();
    router.push("/cart");
  };
  const handleThumbnailPress = async (index: number) => {
    await Haptics.selectionAsync();
    setCurrentImageIndex(index);
    mainCarouselRef.current?.scrollTo({
      index,
      animated: true,
    });
  };

  const handleOpenGallery = async (index: number) => {
    await Haptics.selectionAsync();
    setFullscreenIndex(index);
    setIsGalleryOpen(true);
  };

  const handleFullscreenThumbnailPress = async (index: number) => {
    await Haptics.selectionAsync();
    setFullscreenIndex(index);
    fullscreenCarouselRef.current?.scrollTo({
      index,
      animated: true,
    });
  };

  const handleCloseGallery = async () => {
    await Haptics.selectionAsync();
    setIsGalleryOpen(false);
    setCurrentImageIndex(fullscreenIndex);

    requestAnimationFrame(() => {
      mainCarouselRef.current?.scrollTo({
        index: fullscreenIndex,
        animated: false,
      });
    });
  };

  const handleRelatedProductPress = async (productId: string | number) => {
    await Haptics.selectionAsync();

    router.push({
      pathname: "/product/[id]",
      params: { id: String(productId) },
    });
  };
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Skeleton height={420} />

        <View style={styles.content}>
          <Skeleton width={90} height={14} style={{ marginBottom: 12 }} />
          <Skeleton width="70%" height={28} style={{ marginBottom: 12 }} />
          <Skeleton width={120} height={24} style={{ marginBottom: 20 }} />

          <View style={styles.sectionCard}>
            <Skeleton height={14} style={{ marginBottom: 10 }} />
            <Skeleton height={14} style={{ marginBottom: 10 }} />
            <Skeleton height={14} width="70%" />
          </View>

          <View style={styles.sectionCard}>
            <Skeleton height={14} style={{ marginBottom: 10 }} />
            <Skeleton height={14} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundText}>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageWrap}>
          <Carousel
            ref={mainCarouselRef}
            loop={false}
            pagingEnabled
            snapEnabled
            overscrollEnabled={false}
            width={screenWidth}
            height={440}
            data={galleryData}
            onSnapToItem={setCurrentImageIndex}
            renderItem={({ item, index }) => {
              const isLoaded = loadedImages[item];

              return (
                <Pressable
                  style={styles.carouselItem}
                  onPress={() => handleOpenGallery(index)}
                >
                  {!isLoaded && (
                    <MotiView
                      from={{ opacity: 0.35 }}
                      animate={{ opacity: 0.9 }}
                      transition={{
                        type: "timing",
                        duration: 900,
                        loop: true,
                      }}
                      style={styles.imageShimmer}
                    />
                  )}

                  <Image
                    source={{ uri: item }}
                    style={[styles.image, !isLoaded && { opacity: 0 }]}
                    onLoad={() =>
                      setLoadedImages((prev) => ({
                        ...prev,
                        [item]: true,
                      }))
                    }
                  />
                </Pressable>
              );
            }}
          />

          <Pressable
            style={[styles.iconButton, styles.backButton]}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.smallIconButton}
              onPress={handleToggleWishlist}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? "#DC2626" : "#111827"}
              />
            </Pressable>

            <Pressable style={styles.smallIconButton} onPress={handleCartPress}>
              <Ionicons name="bag-outline" size={20} color="#111827" />

              {totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {totalItems > 99 ? "99+" : totalItems}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.imageBottomOverlay}>
            <View style={styles.overlayPill}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.overlayPillText}>{ratingValue}</Text>
            </View>

            <View style={styles.overlayPill}>
              <Text
                style={[
                  styles.overlayPillText,
                  !isInStock && styles.overlayPillTextOut,
                ]}
              >
                {stockText}
              </Text>
            </View>
          </View>

          {galleryImages.length > 1 && (
            <View style={styles.paginationWrap}>
              {galleryImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 320 }}
          style={styles.content}
        >
          {galleryData.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailStripContent}
              style={styles.thumbnailStrip}
            >
              {galleryData.map((item, index) => {
                const isActive = index === currentImageIndex;

                return (
                  <Pressable
                    key={`${item}-${index}`}
                    onPress={() => handleThumbnailPress(index)}
                    style={[
                      styles.thumbnailButton,
                      isActive && styles.thumbnailButtonActive,
                    ]}
                  >
                    <Image
                      source={{ uri: item }}
                      style={styles.thumbnailImage}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
          <Text style={styles.category}>
            {getProductCategoryName(product.category)}
          </Text>
          <Text style={styles.name}>{product.name}</Text>

          <Text style={styles.price}>{formatPrice(displayPrice)}</Text>

          {product.options?.length ? (
            <View style={styles.variantSection}>
              {product.options.map((option) => (
                <View key={option.name} style={styles.variantOptionGroup}>
                  <Text style={styles.variantOptionLabel}>{option.name}</Text>
                  <View style={styles.variantValueRow}>
                    {option.values.map((value) => {
                      const isActive =
                        selectedOptions[option.name] === value.value;

                      return (
                        <Pressable
                          key={value.value}
                          style={[
                            styles.variantValueButton,
                            isActive && styles.variantValueButtonActive,
                          ]}
                          onPress={() =>
                            setSelectedOptions((current) => ({
                              ...current,
                              [option.name]: value.value,
                            }))
                          }
                        >
                          <Text
                            style={[
                              styles.variantValueText,
                              isActive && styles.variantValueTextActive,
                            ]}
                          >
                            {value.value}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {typeof displayStock === "number" &&
          displayStock > 0 &&
          displayStock <= 5 ? (
            <Text style={styles.lowStockText}>
              Only {displayStock} left in stock
            </Text>
          ) : null}

          {typeof displayStock === "number" && displayStock === 0 ? (
            <Text style={styles.outOfStockText}>Currently out of stock</Text>
          ) : null}
          <View style={styles.infoChipsRow}>
            <View style={styles.infoChip}>
              <Ionicons name="leaf-outline" size={14} color="#DC2626" />
              <Text style={styles.infoChipText}>Skin Friendly</Text>
            </View>

            <View style={styles.infoChip}>
              <Ionicons name="sparkles-outline" size={14} color="#DC2626" />
              <Text style={styles.infoChipText}>Daily Use</Text>
            </View>

            <View style={styles.infoChip}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#DC2626"
              />
              <Text style={styles.infoChipText}>Premium Care</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{descriptionText}</Text>
          </View>
          {/* why you'll love it  */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Why you’ll love it</Text>

            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#DC2626" />
              <Text style={styles.benefitText}>
                Lightweight feel for comfortable everyday wear
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#DC2626" />
              <Text style={styles.benefitText}>
                Premium finish with a polished beauty look
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#DC2626" />
              <Text style={styles.benefitText}>
                Curated for a soft, modern self-care routine
              </Text>
            </View>
          </View>
          {/* how to use section  */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>How to use</Text>

            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Start with clean, dry skin before applying the product.
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Apply gently in small amounts and blend evenly for a natural
                finish.
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Use daily or as needed as part of your regular beauty routine.
              </Text>
            </View>
          </View>
          {/* quantity selector and related products card  */}
          <View style={styles.sectionCard}>
            <View style={styles.quantityHeader}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <Text style={styles.quantityHint}>Adjust before checkout</Text>
            </View>

            <View style={styles.quantityBox}>
              <Pressable
                style={[
                  styles.qtyBtn,
                  (!isInStock || qty <= 1) &&
                    styles.qtyBtnDisabled,
                ]}
                onPress={handleDecreaseQty}
                disabled={!isInStock || qty <= 1}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{qty}</Text>

              <Pressable style={styles.qtyBtn} onPress={handleIncreaseQty}>
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
          {/* Key Highlights Section  */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Key highlights</Text>

            <View style={styles.highlightsGrid}>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Finish</Text>
                <Text style={styles.highlightValue}>Smooth</Text>
              </View>

              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Routine</Text>
                <Text style={styles.highlightValue}>Daily Care</Text>
              </View>

              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Texture</Text>
                <Text style={styles.highlightValue}>Lightweight</Text>
              </View>

              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Skin Feel</Text>
                <Text style={styles.highlightValue}>Comfortable</Text>
              </View>
            </View>
          </View>
          {/* Review Summary Section  */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Review summary</Text>

            <View style={styles.reviewTopRow}>
              <View style={styles.reviewScoreWrap}>
                <Text style={styles.reviewScore}>{ratingValue}</Text>
                <View style={styles.reviewStarsRow}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Ionicons name="star" size={14} color="#f59e0b" />
                </View>
              </View>

              <View style={styles.reviewTextWrap}>
                <Text style={styles.reviewTitle}>Loved by daily users</Text>
                <Text style={styles.reviewText}>
                  Customers appreciate the smooth feel, elegant finish, and easy
                  everyday use.
                </Text>
              </View>
            </View>
          </View>
          {/* show cart added message  */}
          {showAddedMessage && (
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 240 }}
              style={styles.addedMessageWrap}
            >
              <View style={styles.addedMessageLeft}>
                <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                <Text style={styles.addedMessageText}>Added to cart</Text>
              </View>

              <Pressable onPress={handleCartPress}>
                <Text style={styles.viewCartText}>View Cart</Text>
              </Pressable>
            </MotiView>
          )}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <Text style={styles.relatedTitle}>You may also like</Text>
                <Text style={styles.relatedSubtitle}>
                  More picks from{" "}
                  {getProductCategoryName(product.category)}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedList}
              >
                {relatedProducts.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.relatedCard}
                    onPress={() => handleRelatedProductPress(item.id)}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.relatedImage}
                    />

                    <View style={styles.relatedCardContent}>
                      <Text style={styles.relatedCategory}>
                        {getProductCategoryName(item.category)}
                      </Text>
                      <Text style={styles.relatedName} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <View style={styles.relatedMetaRow}>
                        <Text style={styles.relatedPrice}>
                          {formatPrice(item.price)}
                        </Text>

                        <View style={styles.relatedRatingWrap}>
                          <Ionicons name="star" size={12} color="#f59e0b" />
                          <Text style={styles.relatedRatingText}>
                            {typeof item.rating === "number"
                              ? item.rating.toFixed(1)
                              : "4.8"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </MotiView>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>
            Total {qty > 1 ? `(${qty} items)` : "(1 item)"}
          </Text>
          <Text style={styles.footerAmount}>{formatPrice(totalPrice)}</Text>
          <Text style={{ fontSize: 14, marginTop: 4 }}>
            {displayStock === 0
              ? "Out of Stock"
              : displayStock <= 5
                ? `Only ${displayStock} left`
                : "In Stock"}
          </Text>
        </View>

        <View style={styles.footerActions}>
          <Pressable
            style={[
              styles.addToCartBtn,
              styles.addToCartBtnSecondary,
              !isInStock && styles.disabledBtn,
            ]}
            onPress={handleAddToCart}
            disabled={!isInStock}
            android_ripple={{ color: "#FECACA" }}
          >
            <Text style={styles.addToCartTextSecondary}>
              {isAdded ? "Added" : "Add to Cart"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.buyNowBtn, !isInStock && styles.disabledPrimaryBtn]}
            onPress={handleBuyNow}
            disabled={!isInStock}
            android_ripple={{ color: "#C41E1E" }}
          >
            <Text style={styles.buyNowText}>
              {isInStock ? "Buy Now" : "Out of Stock"}
            </Text>
          </Pressable>
        </View>
      </View>
      <Modal
        visible={isGalleryOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleCloseGallery}
      >
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalCounter}>
                {fullscreenIndex + 1} / {galleryData.length}
              </Text>

              <Pressable
                style={styles.modalCloseButton}
                onPress={handleCloseGallery}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </Pressable>
            </View>

            <Carousel
              ref={fullscreenCarouselRef}
              loop={false}
              pagingEnabled
              snapEnabled
              overscrollEnabled={false}
              width={screenWidth}
              height={screenHeight * 0.72}
              data={galleryData}
              defaultIndex={fullscreenIndex}
              onSnapToItem={setFullscreenIndex}
              renderItem={({ item }) => {
                const isLoaded = loadedImages[item];

                return (
                  <View style={styles.fullscreenSlide}>
                    {!isLoaded && (
                      <MotiView
                        from={{ opacity: 0.18 }}
                        animate={{ opacity: 0.36 }}
                        transition={{
                          type: "timing",
                          duration: 900,
                          loop: true,
                        }}
                        style={styles.fullscreenImageShimmer}
                      />
                    )}

                    <Image
                      source={{ uri: item }}
                      style={[
                        styles.fullscreenImage,
                        !isLoaded && { opacity: 0 },
                      ]}
                      resizeMode="contain"
                      onLoad={() =>
                        setLoadedImages((prev) => ({
                          ...prev,
                          [item]: true,
                        }))
                      }
                    />
                  </View>
                );
              }}
            />

            {galleryData.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modalThumbnailStripContent}
                style={styles.modalThumbnailStrip}
              >
                {galleryData.map((item, index) => {
                  const isActive = index === fullscreenIndex;

                  return (
                    <Pressable
                      key={`modal-${item}-${index}`}
                      onPress={() => handleFullscreenThumbnailPress(index)}
                      style={[
                        styles.modalThumbnailButton,
                        isActive && styles.modalThumbnailButtonActive,
                      ]}
                    >
                      <Image
                        source={{ uri: item }}
                        style={styles.modalThumbnailImage}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  thumbnailStrip: {
    marginBottom: 16,
  },

  thumbnailStripContent: {
    paddingRight: 10,
  },

  thumbnailButton: {
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#fff",
  },

  thumbnailButtonActive: {
    borderColor: "#DC2626",
  },
  qtyBtnDisabled: {
    opacity: 0.45,
  },

  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingBottom: 176,
  },
  lowStockText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#b45309",
    marginTop: -8,
    marginBottom: 16,
  },

  outOfStockText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#b91c1c",
    marginTop: -8,
    marginBottom: 16,
  },
  variantSection: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
    gap: 14,
  },
  variantOptionGroup: {
    gap: 8,
  },
  variantOptionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  variantValueRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantValueButton: {
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  variantValueButtonActive: {
    borderColor: "#DC2626",
    backgroundColor: "#DC2626",
  },
  variantValueText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  variantValueTextActive: {
    color: "#ffffff",
  },
  imageWrap: {
    position: "relative",
    height: 440,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageShimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FEF2F2",
    zIndex: 1,
  },
  iconButton: {
    position: "absolute",
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  carouselItem: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  paginationWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: "#ffffff",
  },
  backButton: {
    left: 16,
  },
  headerActions: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  smallIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  imageBottomOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 46,
    flexDirection: "row",
    gap: 10,
  },
  overlayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  overlayPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  overlayPillTextOut: {
    color: "#b45309",
  },
  content: {
    marginTop: -24,
    backgroundColor: "#FEF2F2",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingTop: 24,
  },
  category: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 36,
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  price: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 18,
  },
  infoChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  infoChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4b5563",
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#374151",
  },
  quantityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityHint: {
    fontSize: 12,
    color: "#6b7280",
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FEF2F2",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  qtyBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: -2,
  },
  qtyValue: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  addedMessageWrap: {
    marginTop: -2,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  addedMessageText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
  },
  viewCartText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,250,251,0.98)",
    borderTopWidth: 1,
    borderTopColor: "#FECACA",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
  },

  modalSafeArea: {
    flex: 1,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  modalCounter: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  modalCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  fullscreenSlide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  fullscreenImage: {
    width: "100%",
    height: "100%",
  },

  fullscreenImageShimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  modalThumbnailStrip: {
    marginTop: 14,
  },

  modalThumbnailStripContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
  },

  modalThumbnailButton: {
    width: 68,
    height: 68,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  modalThumbnailButtonActive: {
    borderColor: "#ffffff",
  },

  modalThumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  disabledBtn: {
    opacity: 0.55,
  },

  disabledPrimaryBtn: {
    backgroundColor: "#FECACA",
  },
  footerLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  footerActions: {
    flexDirection: "row",
    gap: 10,
  },
  buyNowBtn: {
    flex: 1.2,
    backgroundColor: "#DC2626",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  buyNowText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  addToCartBtn: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  addToCartBtnSecondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  addToCartTextSecondary: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 16,
    color: "#6b7280",
  },
  relatedSection: {
    marginTop: 4,
  },
  relatedHeader: {
    marginBottom: 14,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  relatedSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  relatedList: {
    paddingRight: 8,
  },
  relatedCard: {
    width: 220,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    marginRight: 14,
    overflow: "hidden",
  },
  relatedImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f3f4f6",
  },
  relatedCardContent: {
    padding: 12,
  },
  relatedCategory: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  relatedName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 20,
    marginBottom: 10,
    minHeight: 40,
  },
  relatedMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  relatedRatingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff7f0",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  relatedRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  highlightItem: {
    width: "47%",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 12,
  },
  highlightLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  reviewTopRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  reviewScoreWrap: {
    width: 76,
    backgroundColor: "#fff7f0",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  reviewScore: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  reviewStarsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewTextWrap: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4b5563",
  },
  addedMessageLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
