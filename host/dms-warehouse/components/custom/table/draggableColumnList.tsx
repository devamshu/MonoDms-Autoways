import { CheckSquare, GripVertical, Square } from "lucide-react-native";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { Text, useTheme, XStack } from "tamagui";
import { Column } from "./types";

const ROW_HEIGHT = 56;
const SPRING = { damping: 20, stiffness: 200, mass: 0.6 };

type Positions = Record<string, number>;

/** Build a { columnId: index } map from an ordered column list. */
function toPositions(columns: Column[]): Positions {
  const positions: Positions = {};
  columns.forEach((col, index) => {
    positions[col.id] = index;
  });
  return positions;
}

/** Remove `activeId` from its slot and re-insert it at `newIndex`, reindexing all. */
function reindex(positions: Positions, activeId: string, newIndex: number): Positions {
  "worklet";
  const ids = Object.keys(positions).sort((a, b) => positions[a] - positions[b]);
  const oldIndex = positions[activeId];
  ids.splice(oldIndex, 1);
  ids.splice(newIndex, 0, activeId);
  const result: Positions = {};
  ids.forEach((id, index) => {
    result[id] = index;
  });
  return result;
}

/** Ordered list of ids derived from a positions map. */
function orderFromPositions(positions: Positions): string[] {
  "worklet";
  return Object.keys(positions).sort((a, b) => positions[a] - positions[b]);
}

interface DraggableColumnListProps {
  /** Columns in their current (temp) order. */
  columns: Column[];
  visibleColumns: string[];
  onToggleVisibility: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

export function DraggableColumnList({
  columns,
  visibleColumns,
  onToggleVisibility,
  onReorder,
}: DraggableColumnListProps) {
  const positions = useSharedValue<Positions>(toPositions(columns));

  // Resync positions whenever the parent order changes (Reset, reopen, or the
  // commit after a drag). During a drag the `columns` prop is unchanged, so this
  // never fires mid-gesture.
  const orderKey = columns.map((c) => c.id).join("|");
  useEffect(() => {
    positions.value = toPositions(columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey]);

  return (
    <Animated.View style={{ height: columns.length * ROW_HEIGHT }}>
      {columns.map((column, index) => (
        <DraggableRow
          key={column.id}
          column={column}
          index={index}
          count={columns.length}
          positions={positions}
          isVisible={visibleColumns.includes(column.id)}
          onToggleVisibility={onToggleVisibility}
          onReorder={onReorder}
        />
      ))}
    </Animated.View>
  );
}

interface DraggableRowProps {
  column: Column;
  index: number;
  count: number;
  positions: SharedValue<Positions>;
  isVisible: boolean;
  onToggleVisibility: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

function DraggableRow({
  column,
  index,
  count,
  positions,
  isVisible,
  onToggleVisibility,
  onReorder,
}: DraggableRowProps) {
  const theme = useTheme();

  // Seed from the render-time index (equals positions.value[column.id] at mount)
  // rather than reading the shared value during render. useAnimatedReaction below
  // keeps `top` in sync afterward.
  const top = useSharedValue(index * ROW_HEIGHT);
  const startTop = useSharedValue(0);
  const isActive = useSharedValue(false);

  // Follow this row's slot whenever it isn't the one being dragged.
  useAnimatedReaction(
    () => positions.value[column.id],
    (index) => {
      if (index == null || isActive.value) return;
      top.value = withSpring(index * ROW_HEIGHT, SPRING);
    },
  );

  const scale = useDerivedValue(() => withSpring(isActive.value ? 1.03 : 1, SPRING));

  const pan = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .onStart(() => {
      isActive.value = true;
      startTop.value = (positions.value[column.id] ?? 0) * ROW_HEIGHT;
    })
    .onUpdate((event) => {
      top.value = startTop.value + event.translationY;
      let newIndex = Math.round(top.value / ROW_HEIGHT);
      newIndex = Math.max(0, Math.min(count - 1, newIndex));
      const currentIndex = positions.value[column.id];
      if (newIndex !== currentIndex) {
        positions.value = reindex(positions.value, column.id, newIndex);
      }
    })
    .onEnd(() => {
      const finalIndex = positions.value[column.id] ?? 0;
      top.value = withSpring(finalIndex * ROW_HEIGHT, SPRING);
    })
    .onFinalize(() => {
      if (!isActive.value) return;
      isActive.value = false;
      runOnJS(onReorder)(orderFromPositions(positions.value));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: top.value,
    height: ROW_HEIGHT,
    zIndex: isActive.value ? 10 : 0,
    opacity: isActive.value ? 0.97 : 1,
    transform: [{ scale: scale.value }],
    shadowColor: "#000",
    shadowOpacity: isActive.value ? 0.18 : 0,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: isActive.value ? 6 : 0,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <XStack
        alignItems="center"
        height={ROW_HEIGHT}
        paddingHorizontal="$2"
        gap="$3"
        backgroundColor="$background"
      >
        <TouchableOpacity onPress={() => onToggleVisibility(column.id)} hitSlop={8}>
          {isVisible ? (
            <CheckSquare size={22} color={theme.primary?.val} />
          ) : (
            <Square size={22} color={theme.borderThinColor?.val} />
          )}
        </TouchableOpacity>

        <Text
          flex={1}
          fontSize={16}
          color={isVisible ? "$descriptionText" : "$secondaryText"}
        >
          {column.label}
        </Text>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={{
              paddingVertical: 12,
              paddingHorizontal: 8,
              justifyContent: "center",
            }}
          >
            <GripVertical size={20} color={theme.borderThinColor?.val} />
          </Animated.View>
        </GestureDetector>
      </XStack>
    </Animated.View>
  );
}
