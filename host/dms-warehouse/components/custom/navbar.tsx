import { usePathname, useRouter } from "expo-router";
import { ArrowLeft, Funnel } from "lucide-react-native";
import { Platform, TouchableOpacity, View } from "react-native";
import { Text, useTheme, XStack } from "tamagui";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/playground": "Customer",
  "/vehicle": "Logistics Vehicle Inventory",
  "/part": "Parts",
  "/orders": "Dealer Orders Dispatch",
  "/branch-inventory": "Branch Logistics Inventory",
  "/setting": "Settings",
  "/profile/personalInformation": "Personal",
  "/profile/loginAndSecurity": "Login & Security",
  "/parts/location-parts": "Location Parts",
};

const BACK_ROUTES = [
  "/profile/personalInformation",
  "/profile/loginAndSecurity",
  "/parts/location-parts",
];

interface NavbarProps {
  onFilterPress?: () => void;
  activeFilterCount?: number;
  showFilter?: boolean;
  customTitle?: string;
  showBackButton?: boolean;
}

export function Navbar({
  onFilterPress,
  activeFilterCount = 0,
  showFilter,
  customTitle,
  showBackButton,
}: NavbarProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const title = (customTitle || ROUTE_TITLES[pathname]) ?? "Dashboard";
  const showBack =
    showBackButton !== undefined
      ? showBackButton
      : BACK_ROUTES.includes(pathname);
  const hasFilters = showFilter !== undefined ? showFilter : false;

  return (
    <XStack
      backgroundColor="$primary"
      height={Platform.OS === "ios" ? 120 : 105}
      paddingHorizontal="$4"
      paddingTop="$6"
      alignItems="center"
      gap="$4"
    >
      {showBack && (
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={24} color={theme.white?.val} />
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
          <Funnel size={22} color={theme.white?.val} />
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
