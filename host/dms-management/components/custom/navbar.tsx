// components/custom/navbar.tsx
import { usePathname, useRouter } from "expo-router";
import { ArrowLeft, Funnel, Menu } from "lucide-react-native";
import { Platform, TouchableOpacity, View } from "react-native";
import { Text, XStack } from "tamagui";
import { useSidebar } from "./sideBarContext";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Home",
  "/crm": "CRM Dashboard",
  "/logistic": "Logistic Dashboard",
  "/dealer": "Dealer Dashboard",
  "/sparepart": "Sparepart Dashboard",
  "/service": "Service Dashboard",
  "/users": "Users",
  "/settings": "Settings",
  "/settings/personal-information": "Personal Information",
  "/settings/login-security": "Login & Security",
  "/(management)/crm": "CRM Dashboard",
  "/(management)/logistic": "Logistic Dashboard",
  "/(management)/dealer": "Dealer Dashboard",
  "/(management)/sparepart": "Sparepart Dashboard",
  "/(management)/service": "Service Dashboard",
  "/(management)/users": "Users",
  "/(management)/settings": "Settings",
  "/(management)/settings/personal-information": "Personal Information",
  "/(management)/settings/login-security": "Login & Security",
};

const BACK_ROUTES = [
  "/settings/personal-information",
  "/settings/login-security",
  "/users/[id]",
  "/(management)/settings/personal-information",
  "/(management)/settings/login-security",
  "/(management)/users/[id]",
];

// Pages that have filter functionality
const PAGES_WITH_FILTERS = ["/users"];

interface NavbarProps {
  onFilterPress?: () => void;
  activeFilterCount?: number;
  showFilter?: boolean; // Add this prop
}

export function Navbar({
  onFilterPress,
  activeFilterCount = 0,
  showFilter, // Add this
}: NavbarProps) {
  const { openSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPathname = pathname.startsWith("/(management)")
    ? pathname.replace("/(management)", "")
    : pathname;

  const title =
    ROUTE_TITLES[pathname] ?? ROUTE_TITLES[normalizedPathname] ?? "Dashboard";
  const showBack =
    BACK_ROUTES.includes(pathname) ||
    BACK_ROUTES.includes(normalizedPathname) ||
    pathname.startsWith("/users/") ||
    pathname.startsWith("/(management)/users/");
  const hasFilters =
    showFilter !== undefined
      ? showFilter
      : PAGES_WITH_FILTERS.includes(pathname);

  return (
    <XStack
      backgroundColor="$primary"
      height={Platform.OS === "ios" ? 120 : 105}
      paddingHorizontal="$4"
      alignItems="center"
      gap="$4"
    >
      {showBack ? (
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={openSidebar}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Menu size={26} color="#fff" />
        </TouchableOpacity>
      )}

      <Text
        flex={1}
        fontSize={24}
        fontWeight="700"
        color="white"
        numberOfLines={1}
      >
        {title}
      </Text>

      {!showBack && hasFilters && (
        <TouchableOpacity
          onPress={onFilterPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ position: "relative" }}
        >
          <Funnel size={22} color="#fff" />
          {activeFilterCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -12,
                backgroundColor: "$error",
                borderRadius: 10,
                minWidth: 18,
                height: 18,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {activeFilterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </XStack>
  );
}
