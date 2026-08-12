import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Button, Text, useTheme, XStack, YStack } from "tamagui";
import { Dropdown } from "../dropdown";
import { PaginationState } from "./types";

interface PaginationControlsProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPage?: boolean;
}

export function PaginationControls({
  pagination,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  showItemsPerPage = true,
}: PaginationControlsProps) {
  const theme = useTheme();
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasPrev,
    hasNext,
  } = pagination;

  // Calculate range of items being displayed
  const safeItemsPerPage = itemsPerPage || 10;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * safeItemsPerPage + 1;
  const endItem = Math.min(currentPage * safeItemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      );
    }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <YStack
      justifyContent="center"
      alignItems="center"
      paddingVertical="$3"
      paddingHorizontal="$2"
      borderLeftWidth={1}
      borderRightWidth={1}
      borderBottomWidth={1}
      borderColor="$inputBorderColor"
      borderBottomEndRadius={12}
      borderBottomStartRadius={12}
      gap="$3"
    >
      {/* Left side: Show X entries info */}
      <XStack gap="$2" alignItems="center">
        <XStack gap="$2" alignItems="center">
          <Text fontSize="$3" color="$secondaryText">
            Show
          </Text>
          {onItemsPerPageChange && (
            <Dropdown
              value={itemsPerPage.toString()}
              onChange={(value) => {
                if (value) onItemsPerPageChange(Number(value));
              }}
              options={itemsPerPageOptions.map((option) => ({
                label: option.toString(),
                value: option.toString(),
              }))}
              noShadow
              size="sm"
              borderRadius={10}
              centered
              hideSearch
              containerStyle={{ width: 80 }}
            />
          )}
          <Text fontSize="$3" color="$secondaryText">
            {startItem} - {endItem} of {totalItems} entries
          </Text>
        </XStack>
      </XStack>

      {/* Right side: Pagination buttons */}
      <XStack gap="$1" alignItems="center">
        {/* Previous Button */}
        <Button
          size="$3"
          chromeless
          disabled={!hasPrev}
          onPress={() => onPageChange(currentPage - 1)}
          paddingHorizontal="$2"
          opacity={!hasPrev ? 0.5 : 1}
        >
          <ChevronLeft
            size={18}
            color={!hasPrev ? theme.disabled?.val : theme.color?.val}
            pointerEvents="none"
          />
        </Button>

        {/* Page Numbers */}
        <XStack gap="$1" alignItems="center">
          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <Button
                key={index}
                minWidth={28}
                height={28}
                paddingHorizontal="$2"
                chromeless
                alignItems="center"
                justifyContent="center"
                backgroundColor={
                  page === currentPage ? "$primary" : "transparent"
                }
                onPress={() => onPageChange(page)}
                borderRadius={100}
              >
                <Text
                  fontSize="$3"
                  fontWeight={page === currentPage ? "600" : "400"}
                  color={page === currentPage ? "$white" : "$color"}
                >
                  {page}
                </Text>
              </Button>
            ) : (
              <Text
                key={index}
                paddingHorizontal="$2"
                color="$color"
                fontSize="$3"
              >
                {page}
              </Text>
            ),
          )}
        </XStack>

        {/* Next Button */}
        <Button
          size="$3"
          chromeless
          disabled={!hasNext}
          alignItems="center"
          justifyContent="center"
          onPress={() => onPageChange(currentPage + 1)}
          paddingHorizontal="$2"
          opacity={!hasNext ? 0.5 : 1}
        >
          <ChevronRight
            size={18}
            color={!hasNext ? theme.disabled?.val : theme.color?.val}
            pointerEvents="none"
          />
        </Button>
      </XStack>
    </YStack>
  );
}
