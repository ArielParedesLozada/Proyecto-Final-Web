import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Text, useTheme, Card, TouchableRipple, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Goal } from '@/services/goals';
import Button from '@/components/ui/Button';
import {
  formatDateToYMD,
  parseYMDToDate,
  formatDateShort,
} from '@/utils/date';

export interface TransactionsFiltersProps {
  goals: Goal[];
  selectedGoal: Goal | null;
  onGoalChange: (goal: Goal | null) => void;
  transactionType: 'Fijo' | 'Variable' | null;
  onTransactionTypeChange: (type: 'Fijo' | 'Variable' | null) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClear: () => void;
  loading?: boolean;
}

type Rect = { x: number; y: number; width: number; height: number };

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export default function TransactionsFilters({
  goals,
  selectedGoal,
  onGoalChange,
  transactionType,
  onTransactionTypeChange,
  dateRange,
  onDateRangeChange,
  onClear,
  loading = false,
}: TransactionsFiltersProps) {
  const theme = useTheme();

  const [goalMenuVisible, setGoalMenuVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Medición y posicionamiento del dropdown
  const goalSelectRef = useRef<View>(null);
  const [anchorRect, setAnchorRect] = useState<Rect | null>(null);

  const measureAnchor = () => {
    // measureInWindow da coordenadas absolutas, perfectas para posicionar en Portal
    goalSelectRef.current?.measureInWindow?.((x, y, width, height) => {
      setAnchorRect({ x, y, width, height });
    });
  };

  // Recalcular al rotar o cambiar dimensiones
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', () => {
      if (goalMenuVisible) {
        // Re-medimos para recolocar
        requestAnimationFrame(measureAnchor);
      }
    });
    return () => {
      // @ts-ignore RN < 0.71 compat
      sub?.remove?.();
    };
  }, [goalMenuVisible]);

  const openGoalMenu = () => {
    if (!loading && goals.length > 0) {
      measureAnchor();
      setGoalMenuVisible(true);
    }
  };

  const closeGoalMenu = () => setGoalMenuVisible(false);

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && date) {
      const formatted = formatDateToYMD(date);
      onDateRangeChange({ ...dateRange, start: formatted });
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && date) {
      const formatted = formatDateToYMD(date);
      onDateRangeChange({ ...dateRange, end: formatted });
    }
  };

  const toggleTransactionType = (type: 'Fijo' | 'Variable') => {
    if (transactionType === type) {
      onTransactionTypeChange(null);
    } else {
      onTransactionTypeChange(type);
    }
  };

  // Cálculo de posición del dropdown en pantalla
  const windowW = Dimensions.get('window').width;
  const windowH = Dimensions.get('window').height;

  // Márgenes para que no pegue al borde
  const SCREEN_PADDING = 8;
  const DROPDOWN_MAX_HEIGHT = 320;
  const DROPDOWN_VERTICAL_GAP = 4;

  let dropdownStyleAbsolute: any = {};
  if (anchorRect) {
    const width = clamp(anchorRect.width, 160, windowW - SCREEN_PADDING * 2);
    const left = clamp(anchorRect.x, SCREEN_PADDING, windowW - SCREEN_PADDING - width);
    // Por defecto, abrimos hacia abajo; si no cabe, abrimos hacia arriba
    const preferredTop = anchorRect.y + anchorRect.height + DROPDOWN_VERTICAL_GAP;
    const spaceBelow = windowH - preferredTop - SCREEN_PADDING;
    const openUpwards = spaceBelow < 140; // heurística básica

    const top = openUpwards
      ? clamp(anchorRect.y - DROPDOWN_VERTICAL_GAP - DROPDOWN_MAX_HEIGHT, SCREEN_PADDING, windowH - SCREEN_PADDING)
      : preferredTop;

    dropdownStyleAbsolute = {
      position: 'absolute',
      top,
      left,
      width,
      maxHeight: DROPDOWN_MAX_HEIGHT,
    };
  }

  return (
    <>
      <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <View style={styles.row}>
            {/* Selector de Meta */}
            <View style={styles.fieldContainer}>
              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                Meta:
              </Text>

              <TouchableRipple
                onPress={openGoalMenu}
                disabled={loading || goals.length === 0}
                rippleColor={theme.colors.primary + '20'}
                style={styles.touchableRipple}
              >
                <View
                  ref={goalSelectRef}
                  style={[
                    styles.selectContainer,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                  onLayout={() => {
                    // sincroniza la medida si ya está abierto
                    if (goalMenuVisible) requestAnimationFrame(measureAnchor);
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.selectText,
                      {
                        color: selectedGoal ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {selectedGoal?.name || 'Selecciona una meta'}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.selectIcon,
                      {
                        color: theme.colors.onSurfaceVariant,
                        transform: [{ rotate: goalMenuVisible ? '180deg' : '0deg' }],
                      },
                    ]}
                  >
                    ▼
                  </Text>
                </View>
              </TouchableRipple>
            </View>

            {/* Tipo de Transacción */}
            <View style={styles.field}>
              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                Tipo:
              </Text>
              <View style={styles.typeContainer}>
                {(['Fijo', 'Variable'] as const).map((type) => {
                  const isActive = transactionType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => toggleTransactionType(type)}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceVariant,
                          borderColor: isActive ? theme.colors.primary : theme.colors.outline,
                        },
                      ]}
                    >
                      <Text
                        variant="bodySmall"
                        style={{
                          color: isActive ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                          fontWeight: isActive ? '600' : '400',
                        }}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Fecha Desde */}
            <View style={styles.field}>
              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                Desde:
              </Text>
              <Pressable
                onPress={() => {
                  if (dateRange.start) {
                    setStartDate(parseYMDToDate(dateRange.start));
                  }
                  setShowStartDatePicker(true);
                }}
              >
                <View
                  style={[
                    styles.dateContainer,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                >
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.dateText,
                      { color: dateRange.start ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {dateRange.start ? formatDateShort(dateRange.start) : 'dd/mm/aaaa'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={18} color={theme.colors.primary} />
                </View>
              </Pressable>
              {Platform.OS !== 'web' && showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                />
              )}
            </View>

            {/* Fecha Hasta */}
            <View style={styles.field}>
              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                Hasta:
              </Text>
              <Pressable
                onPress={() => {
                  if (dateRange.end) {
                    setEndDate(parseYMDToDate(dateRange.end));
                  }
                  setShowEndDatePicker(true);
                }}
              >
                <View
                  style={[
                    styles.dateContainer,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                >
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.dateText,
                      { color: dateRange.end ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {dateRange.end ? formatDateShort(dateRange.end) : 'dd/mm/aaaa'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={18} color={theme.colors.primary} />
                </View>
              </Pressable>
              {Platform.OS !== 'web' && showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                />
              )}
            </View>

            {/* Botón Limpiar */}
            <View style={styles.field}>
              <Text variant="labelMedium" style={[styles.label, { color: 'transparent' }]}>{' '}</Text>
              <Button variant="outlined" onPress={onClear} style={styles.clearButton}>
                Limpiar
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Menú de metas: en Portal, por encima de todo, posicionado con coordenadas absolutas */}
      <Portal>
        <Modal visible={goalMenuVisible} transparent animationType="fade" onRequestClose={closeGoalMenu}>
          <TouchableWithoutFeedback onPress={closeGoalMenu}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          {anchorRect && (
            <View
              style={[
                styles.dropdownPortal,
                dropdownStyleAbsolute,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                },
              ]}
            >
              <ScrollView
                style={styles.dropdownScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {goals.map((goal, index) => {
                  const selected = selectedGoal?.id === goal.id;
                  return (
                    <TouchableRipple
                      key={goal.id}
                      onPress={() => {
                        onGoalChange(goal);
                        closeGoalMenu();
                      }}
                      style={[
                        styles.dropdownItem,
                        index !== goals.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.outline + '40',
                        },
                        selected && { backgroundColor: theme.colors.primaryContainer },
                      ]}
                    >
                      <Text
                        variant="bodyMedium"
                        style={[
                          styles.dropdownItemText,
                          {
                            color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                            fontWeight: selected ? '600' : '400',
                          },
                        ]}
                      >
                        {goal.name}
                      </Text>
                    </TouchableRipple>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'visible',
  },
  content: {
    padding: 12,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    overflow: 'visible',
  },
  field: {
    flex: 1,
    minWidth: 120,
  },
  fieldContainer: {
    flex: 1,
    minWidth: 120,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
  },
  touchableRipple: {
    borderRadius: 4,
    marginBottom: 8,
  },
  selectContainer: {
    borderRadius: 4,
    padding: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
  },
  selectIcon: {
    fontSize: 12,
    marginLeft: 8,
  },

  // Dropdown en Portal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  dropdownPortal: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.84,
  },
  dropdownScroll: {
    maxHeight: 320,
  },
  dropdownItem: {
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  dropdownItemText: {
    fontSize: 14,
  },

  typeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  dateText: {
    flex: 1,
  },
  clearButton: {
    minHeight: 40,
  },
});
