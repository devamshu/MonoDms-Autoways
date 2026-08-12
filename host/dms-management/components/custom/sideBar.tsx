import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  LayoutGridIcon,
  LogOut,
  Settings,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Separator, Text, useTheme, View, XStack, YStack } from "tamagui";
import { resetAuth } from "../../../../app/features/auth/store/auth.slice";
import { logout } from "../../../../app/features/auth/store/auth.thunks";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { clearProfile } from "../../app/features/profile/store/profile.slice";
import { fetchProfile } from "../../app/features/profile/store/profile.thunk";
import { AppRoutes } from "../../app/utils/navigation";
import { Images } from "../../constants/image";
import { GenericModal } from "./model/genericModal";
import { useSidebar } from "./sideBarContext";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);
const SWIPE_EDGE_WIDTH = 24;
const SPRING = { damping: 20, stiffness: 200, mass: 0.8 };

const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

const MENU_ITEMS = [
  {
    id: "dashboard",
    title: "Dashboard",
    Icon: LayoutGridIcon,
    children: [
      {
        id: "crm",
        title: "CRM Dashboard",
        path: "/(management)/crm",
      },
      {
        id: "logistic",
        title: "Logistic Dashboard",
        path: "/(management)/logistic",
      },
      {
        id: "dealer",
        title: "Dealer Dashboard",
        path: "/(management)/dealer",
      },
      {
        id: "sparepart",
        title: "Sparepart Dashboard",
        path: "/(management)/sparepart",
      },
      {
        id: "service",
        title: "Service Dashboard",
        path: "/(management)/service",
      },
    ],
  },
  {
    id: "users",
    title: "Users",
    Icon: Users,
    path: "/(management)/users",
  },
  {
    id: "settings",
    title: "Settings",
    Icon: Settings,
    path: "/(management)/settings",
  },
];

interface SidebarProps {
  activeRoute?: string;
  onNavigate?: (path: string) => void;
}

export default function Sidebar({
  activeRoute = "",
  onNavigate,
}: SidebarProps) {
  const { isOpen, openSidebar, closeSidebar } = useSidebar();
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const { profile, isLoading } = useAppSelector((state) => state.profile);

  const [selectedPath, setSelectedPath] = useState(activeRoute || "/crm");
  const [expandedMenu, setExpandedMenu] = useState<string | null>("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    closeSidebar();
    await dispatch(logout());
    dispatch(resetAuth());
    dispatch(clearProfile());
    router.replace(AppRoutes.LOGIN);
  };

  useEffect(() => {
    if (!profile) dispatch(fetchProfile());
  }, [dispatch, profile]);

  const getFullImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
      return imagePath;
    const baseUrl = IMAGE_BASE_URL?.replace(/\/$/, "");
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${baseUrl}${path}`;
  };

  const fullName =
    [profile?.first_name, profile?.middle_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") ||
    profile?.username ||
    "—";

  const profileImageUri = getFullImageUrl(profile?.image);

  useEffect(() => {
    if (activeRoute) setSelectedPath(activeRoute);
  }, [activeRoute]);

  useEffect(() => {
    translateX.value = withSpring(isOpen ? 0 : -SIDEBAR_WIDTH, SPRING);
  }, [isOpen]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      const startedNearEdge = e.absoluteX - e.translationX < SWIPE_EDGE_WIDTH;
      if (!isOpen && !startedNearEdge) return;
      translateX.value = isOpen
        ? Math.min(0, e.translationX)
        : Math.max(-SIDEBAR_WIDTH, e.translationX);
    })
    .onEnd((e) => {
      const shouldOpen = isOpen
        ? e.translationX > -(SIDEBAR_WIDTH / 3)
        : e.translationX > SIDEBAR_WIDTH / 3;
      if (shouldOpen) {
        translateX.value = withSpring(0, SPRING);
        runOnJS(openSidebar)();
      } else {
        translateX.value = withSpring(-SIDEBAR_WIDTH, SPRING);
        runOnJS(closeSidebar)();
      }
    });

  const panelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SIDEBAR_WIDTH, 0], [0, 1]),
    pointerEvents: translateX.value <= -SIDEBAR_WIDTH ? "none" : "auto",
  }));

  const handleNavigate = (path: string) => {
    setSelectedPath(path);
    onNavigate?.(path);
    closeSidebar();
  };

  return (
    <>
      <AnimatedView
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0,0,0,0.45)"
        zIndex={10}
        style={overlayAnimStyle}
      >
        <Pressable style={{ flex: 1 }} onPress={closeSidebar} />
      </AnimatedView>

      <GestureDetector gesture={pan}>
        <AnimatedYStack
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          width={SIDEBAR_WIDTH}
          backgroundColor="$background"
          zIndex={20}
          shadowColor="$black"
          shadowOffset={{ width: 6, height: 0 }}
          shadowOpacity={0.2}
          shadowRadius={24}
          elevation={24}
          style={panelAnimStyle}
        >
          <XStack
            justifyContent="flex-end"
            paddingTop={Platform.OS === "ios" ? 54 : 24}
            paddingHorizontal="$4"
            paddingBottom="$2"
          >
            <Pressable onPress={closeSidebar} hitSlop={8}>
              <XStack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor="$backgroundSecondary"
                alignItems="center"
                justifyContent="center"
                marginTop={15}
              >
                <ChevronLeft size={20} color={theme.descriptionText?.val} />
              </XStack>
            </Pressable>
          </XStack>
          <YStack
            alignItems="center"
            paddingVertical="$5"
            paddingHorizontal="$6"
          >
            <XStack
              width={72}
              height={72}
              borderRadius={36}
              alignItems="center"
              justifyContent="center"
              marginBottom="$3"
            >
              <Image
                source={
                  profileImageUri ? { uri: profileImageUri } : Images.profile
                }
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  alignSelf: "center",
                }}
              />
            </XStack>
            <Text
              fontSize={17}
              fontWeight="700"
              color="$descriptionText"
              textAlign="center"
              marginBottom="$1"
            >
              {isLoading && !profile ? "Loading..." : fullName}
            </Text>
            <Text fontSize={13} color="$secondaryText">
              {profile?.username || (isLoading ? "Loading..." : "—")}
            </Text>
          </YStack>
          <Separator borderColor="$borderColor" />
          <Animated.ScrollView showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map((item) => {
              const isExpanded = expandedMenu === item.id;
              const isParentActive =
                selectedPath === item.path ||
                item.children?.some((c) => c.path === selectedPath);

              return (
                <YStack key={item.id}>
                  <Pressable
                    onPress={() => {
                      if (item.children) {
                        setExpandedMenu((p) =>
                          p === item.id ? null : item.id,
                        );
                      } else if (item.path) {
                        handleNavigate(item.path);
                      }
                    }}
                  >
                    <XStack
                      alignItems="center"
                      paddingVertical="$4"
                      paddingHorizontal="$6"
                      gap="$3"
                    >
                      <item.Icon
                        size={20}
                        color={
                          isParentActive
                            ? theme.primary?.val
                            : theme.secondaryText?.val
                        }
                      />
                      <Text
                        flex={1}
                        fontSize={15}
                        fontWeight="600"
                        color={isParentActive ? "$primary" : "$descriptionText"}
                      >
                        {item.title}
                      </Text>
                      {item.children &&
                        (isExpanded ? (
                          <ChevronUp
                            size={16}
                            color={
                              isParentActive
                                ? theme.primary?.val
                                : theme.secondaryText?.val
                            }
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            color={
                              isParentActive
                                ? theme.primary?.val
                                : theme.secondaryText?.val
                            }
                          />
                        ))}
                    </XStack>
                  </Pressable>

                  {item.children &&
                    isExpanded &&
                    item.children.map((child) => {
                      const isChildActive = selectedPath === child.path;
                      return (
                        <Pressable
                          key={child.id}
                          onPress={() => handleNavigate(child.path)}
                        >
                          <XStack
                            alignItems="center"
                            paddingVertical="$3"
                            paddingHorizontal="$9"
                            gap="$3"
                          >
                            <View
                              width={16}
                              height={2}
                              borderRadius={1}
                              backgroundColor={
                                isChildActive ? "$primary" : "$borderColor"
                              }
                            />
                            <Text
                              fontSize={14}
                              fontWeight={isChildActive ? "600" : "400"}
                              color={
                                isChildActive ? "$primary" : "$secondaryText"
                              }
                            >
                              {child.title}
                            </Text>
                          </XStack>
                        </Pressable>
                      );
                    })}

                  <Separator borderColor="$inputBorderColor" />
                </YStack>
              );
            })}

            <Pressable onPress={() => setShowLogoutModal(true)}>
              <XStack
                alignItems="center"
                paddingVertical="$4"
                paddingHorizontal="$6"
                gap="$3"
              >
                <LogOut size={20} color={theme.error?.val} />
                <Text fontSize={15} fontWeight="600" color={theme.error?.val}>
                  Logout
                </Text>
              </XStack>
            </Pressable>
          </Animated.ScrollView>
        </AnimatedYStack>
      </GestureDetector>

      <GenericModal
        isOpen={showLogoutModal}
        variant="confirmCancel"
        imageSource={Images.logout}
        title="Logout ?"
        description="Are you sure you want to log out?"
        cancelText="Cancel"
        confirmText="Logout"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
