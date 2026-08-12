import { useAppSelector } from "../../../../../app/features/hooks";
import { UserDetailScreenProps } from "../../../app/features/users/types";
import { UserDetailCard } from "../../../components/custom/users/userDetailCard";
import { ScrollView, Text, YStack } from "tamagui";

export function UserDetailScreen({ id }: UserDetailScreenProps) {
  const { users } = useAppSelector((state) => state.managementUsers);

  const user = users.find((u) => String(u.id) === String(id)) ?? null;

  if (!user) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundSecondary"
      >
        <Text color="$secondaryText">User not found</Text>
      </YStack>
    );
  }

  const groupNames =
    user.groups && user.groups.length > 0
      ? user.groups.map((g) => g.name).join(", ")
      : "No groups";

  return (
    <ScrollView flex={1} backgroundColor="$backgroundSecondary">
      <YStack padding="$4" gap="$4">
        <UserDetailCard
          title="General Info"
          rows={[
            { label: "Username", value: user.username },
            { label: "Email", value: user.email },
            {
              label: "Full Name",
              value: `${user.first_name} ${user.last_name}`.trim() || "—",
            },
            {
              label: "Dealer",
              value:
                user.dealer !== null && user.dealer !== undefined
                  ? String(user.dealer)
                  : "—",
            },
          ]}
        />

        <UserDetailCard
          title="Login Info"
          rows={[
            {
              label: "Last Login",
              value: user.last_login
                ? new Date(user.last_login).toLocaleString()
                : "—",
            },
            {
              label: "Last Activity",
              value: user.last_activity
                ? new Date(user.last_activity).toLocaleString()
                : "—",
            },
            {
              label: "Failed Login Attempts",
              value: user.failed_login_attempts?.toString() ?? "—",
            },
            {
              label: "Last IP Address",
              value: user.last_ip_address ?? "—",
            },
          ]}
        />

        <UserDetailCard title="Group">
          <Text fontSize="$3" color="$color" fontWeight="600">
            {groupNames}
          </Text>
        </UserDetailCard>
      </YStack>
    </ScrollView>
  );
}
