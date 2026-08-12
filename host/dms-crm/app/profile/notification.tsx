import { Image } from "react-native";
import { ScrollView, Text, YStack } from "tamagui";
import { Images } from "../../constants/image";

const noNotificationImage = Images.noNotification;

export default function NotificationsScreen() {
  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="$5"
          paddingVertical="$8"
          minHeight="100%"
          gap="$4"
        >
          {/* Centered Content */}
          <YStack
            alignItems="center"
            justifyContent="center"
            gap="$4"
            width="100%"
          >
            {/* Notification Image */}
            <Image
              source={noNotificationImage}
              style={{
                width: 120,
                height: 120,
                resizeMode: "contain",
              }}
            />

            {/* Title */}
            <Text
              fontSize="$6"
              fontWeight="600"
              color="$descriptionText"
              textAlign="center"
            >
              No notifications yet!
            </Text>

            {/* Description */}
            <Text
              fontSize="$4"
              color="$secondaryText"
              textAlign="center"
              lineHeight={22}
              maxWidth="80%"
            >
              We will let you know when the updates arrive
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
