import { EmailEntry, PhoneEntry } from "../../../app/features/customer/types";
import { FieldErrors } from "../../../app/features/customer/validation";
import { Dropdown } from "../../../components/custom/dropdown";
import { AppInput } from "../../../components/custom/input";
import { Trash2 } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";
import { RequiredLabel } from "../requiredLabel";

// ─── Options ──────────────────────────────────────────────────────────────────
const PHONE_CATEGORY_OPTIONS = [
  { label: "Home", value: "home" },
  { label: "Office", value: "office" },
  { label: "Mobile", value: "mobile" },
  { label: "Other", value: "other" },
];

const EMAIL_CATEGORY_OPTIONS = [
  { label: "Personal", value: "personal" },
  { label: "Office", value: "office" },
];

const RELATION_OPTIONS = [
  { label: "Self", value: "1" },
  { label: "Spouse", value: "2" },
  { label: "Child", value: "3" },
  { label: "Parent", value: "4" },
  { label: "Other", value: "5" },
];

const COUNTRY_CODE_OPTIONS = [
  { label: "NP", value: "+977" },
  { label: "IN", value: "+91" },
  { label: "US", value: "+1" },
  { label: "UK", value: "+44" },
  { label: "AU", value: "+61" },
  { label: "CN", value: "+86" },
  { label: "JP", value: "+81" },
  { label: "KR", value: "+82" },
  { label: "SG", value: "+65" },
  { label: "AE", value: "+971" },
];

type Props = {
  phoneEntries: PhoneEntry[];
  emailEntries: EmailEntry[];
  onPhoneEntriesChange: (entries: PhoneEntry[]) => void;
  onEmailEntriesChange: (entries: EmailEntry[]) => void;
  /** Keyed `phone:<entryId>` / `email:<entryId>`. */
  errors?: FieldErrors;
};

const newPhone = (): PhoneEntry => ({
  id: Date.now().toString(),
  category: "mobile",
  phone: "",
  country_code: "+977",
  relation: 1,
});

const newEmail = (): EmailEntry => ({
  id: (Date.now() + 1).toString(),
  category: "personal",
  email: "",
  relation: 1,
});

// ─── Delete button ────────────────────────────────────────────────────────────
function DeleteButton({ onPress }: { onPress: () => void }) {
  return (
    <XStack
      onPress={onPress}
      cursor="pointer"
      alignSelf="center"
      paddingLeft="$2"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Trash2 size={20} color="#EF4444" />
    </XStack>
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────
function Separator() {
  return (
    <XStack
      height={1}
      backgroundColor="$inputBorderColor"
      marginVertical="$2"
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function CustomerStepperThree({
  phoneEntries,
  emailEntries,
  onPhoneEntriesChange,
  onEmailEntriesChange,
  errors = {},
}: Props) {
  // ── Phone ───────────────────────────────────────────────────────────────────
  const handlePhoneChange = (
    id: string,
    key: keyof Omit<PhoneEntry, "id">,
    value: string | number,
  ) =>
    onPhoneEntriesChange(
      phoneEntries.map((e) => (e.id === id ? { ...e, [key]: value } : e)),
    );

  const handlePhoneDelete = (id: string) => {
    if (phoneEntries.length === 1) return;
    onPhoneEntriesChange(phoneEntries.filter((e) => e.id !== id));
  };

  // ── Email ───────────────────────────────────────────────────────────────────
  const handleEmailChange = (
    id: string,
    key: keyof Omit<EmailEntry, "id">,
    value: string | number,
  ) =>
    onEmailEntriesChange(
      emailEntries.map((e) => (e.id === id ? { ...e, [key]: value } : e)),
    );

  const handleEmailDelete = (id: string) => {
    if (emailEntries.length === 1) return;
    onEmailEntriesChange(emailEntries.filter((e) => e.id !== id));
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <YStack gap="$4">
      <Text fontSize="$5" fontWeight="700" color="$color">
        Contact Information
      </Text>

      {/* ── Phone ─────────────────────────────────────────────────────────── */}
      <YStack gap="$2">
        <RequiredLabel>Contact</RequiredLabel>

        {phoneEntries.map((entry, index) => (
          <YStack key={entry.id} gap="$2">
            {/* Category and Relation Row */}
            <XStack alignItems="center" gap="$2">
              <Dropdown
                containerStyle={{ flex: 1 }}
                placeholder="Category"
                options={PHONE_CATEGORY_OPTIONS}
                value={entry.category}
                onChange={(v) =>
                  handlePhoneChange(
                    entry.id,
                    "category",
                    v as PhoneEntry["category"],
                  )
                }
              />

              <Dropdown
                containerStyle={{ flex: 1 }}
                placeholder="Relation"
                options={RELATION_OPTIONS}
                value={String(entry.relation || 1)}
                onChange={(v) =>
                  handlePhoneChange(entry.id, "relation", parseInt(v, 10))
                }
              />

              {phoneEntries.length > 1 && (
                <DeleteButton onPress={() => handlePhoneDelete(entry.id)} />
              )}
            </XStack>

            {/* Country Code and Phone Row */}
            {/* flex-start, not center: an error message grows the phone field
                downward and would otherwise drag the code select off its row. */}
            <XStack alignItems="flex-start" gap="$2">
              <Dropdown
                containerStyle={{ width: 100, flexShrink: 0 }}
                placeholder="Code"
                options={COUNTRY_CODE_OPTIONS}
                value={entry.country_code}
                onChange={(v) => handlePhoneChange(entry.id, "country_code", v)}
              />

              <AppInput
                flex={1}
                value={entry.phone}
                onChangeText={(v) => handlePhoneChange(entry.id, "phone", v)}
                placeholder="Enter Contact"
                keyboardType="phone-pad"
                error={errors[`phone:${entry.id}`]}
              />
            </XStack>

            {/* Separator between entries */}
            {index < phoneEntries.length - 1 && <Separator />}
          </YStack>
        ))}

        <XStack
          onPress={() => onPhoneEntriesChange([...phoneEntries, newPhone()])}
          alignItems="center"
          cursor="pointer"
          paddingVertical="$1"
        >
          <Text fontSize="$4" color="$ongoing" fontWeight="600">
            + Add More
          </Text>
        </XStack>
      </YStack>

      {/* Separator between Phone and Email sections */}
      <Separator />

      {/* ── Email ─────────────────────────────────────────────────────────── */}
      <YStack gap="$2">
        <RequiredLabel>Email</RequiredLabel>

        {emailEntries.map((entry, index) => (
          <YStack key={entry.id} gap="$2">
            {/* Category and Relation Row */}
            <XStack alignItems="center" gap="$2">
              <Dropdown
                containerStyle={{ flex: 1 }}
                placeholder="Category"
                options={EMAIL_CATEGORY_OPTIONS}
                value={entry.category}
                onChange={(v) =>
                  handleEmailChange(
                    entry.id,
                    "category",
                    v as EmailEntry["category"],
                  )
                }
              />

              <Dropdown
                containerStyle={{ flex: 1 }}
                placeholder="Relation"
                options={RELATION_OPTIONS}
                value={String(entry.relation || 1)}
                onChange={(v) =>
                  handleEmailChange(entry.id, "relation", parseInt(v, 10))
                }
              />

              {emailEntries.length > 1 && (
                <DeleteButton onPress={() => handleEmailDelete(entry.id)} />
              )}
            </XStack>

            {/* Email Row */}
            <XStack alignItems="flex-start" gap="$2">
              <AppInput
                flex={1}
                value={entry.email}
                onChangeText={(v) => handleEmailChange(entry.id, "email", v)}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors[`email:${entry.id}`]}
              />
            </XStack>

            {/* Separator between entries */}
            {index < emailEntries.length - 1 && <Separator />}
          </YStack>
        ))}

        <XStack
          onPress={() => onEmailEntriesChange([...emailEntries, newEmail()])}
          alignItems="center"
          cursor="pointer"
          paddingVertical="$1"
        >
          <Text fontSize="$4" color="$ongoing" fontWeight="600">
            + Add More
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
