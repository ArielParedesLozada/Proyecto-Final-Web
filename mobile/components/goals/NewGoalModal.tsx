import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Text, TextInput, useTheme, TouchableRipple } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal } from '../ui';
import Button from '../ui/Button';
import { Goal, CATEGORIES, CreateGoalPayload } from '@/services/goals';
import {
  formatDateToYMD,
  parseYMDToDate,
  formatDateToDisplay,
  formatDateShort,
  getTodayYMD,
  isTodayOrFuture,
} from '@/utils/date';

export interface NewGoalModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (payload: CreateGoalPayload & { id?: number; status?: string }) => void;
  mode?: 'create' | 'edit';
  initialGoal?: Goal | null;
}

export default function NewGoalModal({
  visible,
  onDismiss,
  onSubmit,
  mode = 'create',
  initialGoal,
}: NewGoalModalProps) {
  const theme = useTheme();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    targetAmount: '',
    deadline: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalForm, setOriginalForm] = useState(form);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (visible) {
      if (isEdit && initialGoal) {
        const editForm = {
          name: initialGoal.name || '',
          category: initialGoal.category || '',
          description: initialGoal.description || '',
          targetAmount: initialGoal.target_amount ? String(initialGoal.target_amount) : '',
          deadline: initialGoal.target_date || '',
        };
        setForm(editForm);
        setOriginalForm(editForm);
      } else {
        const createForm = {
          name: '',
          category: '',
          description: '',
          targetAmount: '',
          deadline: '',
        };
        setForm(createForm);
        setOriginalForm(createForm);
      }
      setErrors({});
    }
  }, [visible, isEdit, initialGoal]);

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Ingresa un nombre';
    if (!form.category) e.category = 'Selecciona una categoría';
    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      e.targetAmount = 'Monto objetivo inválido';
    }
    if (!form.deadline) {
      e.deadline = 'Selecciona la fecha límite';
    } else {
      if (!isTodayOrFuture(form.deadline)) {
        e.deadline = 'La fecha debe ser hoy o una fecha futura';
      }
    }
    return e;
  };

  const isFormComplete = () => {
    return (
      form.name.trim() &&
      form.category &&
      form.targetAmount &&
      Number(form.targetAmount) > 0 &&
      form.deadline
    );
  };

  const hasChanges = () => {
    return (
      form.name.trim() !== originalForm.name ||
      form.category !== originalForm.category ||
      form.description.trim() !== originalForm.description ||
      form.targetAmount !== originalForm.targetAmount ||
      form.deadline !== originalForm.deadline
    );
  };

  const isButtonEnabled = () => {
    if (mode === 'create') {
      return isFormComplete();
    } else {
      return hasChanges() && isFormComplete();
    }
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    const base: CreateGoalPayload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || null,
      target_amount: Number(form.targetAmount),
      target_date: form.deadline,
    };

    const payload = isEdit
      ? { id: initialGoal?.id, status: initialGoal?.status || 'active', ...base }
      : { status: 'active', ...base };

    onSubmit(payload);
  };

  const today = getTodayYMD();

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      title={isEdit ? 'Editar Meta de Ahorro' : 'Nueva Meta de Ahorro'}
      cancelable
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text
            variant="bodySmall"
            style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}
          >
            {isEdit ? 'Actualiza los datos de tu meta.' : 'Crea una nueva meta de ahorro.'}
          </Text>

          {/* Nombre */}
          <View style={styles.field}>
            <Text
              variant="bodyMedium"
              style={[styles.label, { color: theme.colors.onSurface }]}
            >
              Nombre de la Meta
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Ej. Vacaciones de verano"
              value={form.name}
              onChangeText={(text) => setForm((s) => ({ ...s, name: text }))}
              error={!!errors.name}
              style={styles.input}
            />
            {errors.name && (
              <Text
                variant="bodySmall"
                style={[styles.error, { color: theme.colors.error }]}
              >
                {errors.name}
              </Text>
            )}
          </View>

          {/* Categoría */}
          <View style={styles.field}>
            <Text
              variant="bodyMedium"
              style={[styles.label, { color: theme.colors.onSurface }]}
            >
              Categoría
            </Text>
            <TouchableRipple
              onPress={() => setCategoryMenuVisible(!categoryMenuVisible)}
              rippleColor={theme.colors.primary + '20'}
              style={styles.touchableRipple}
            >
              <View
                style={[
                  styles.selectContainer,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: errors.category ? theme.colors.error : theme.colors.outline,
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.selectText,
                    {
                      color: form.category
                        ? theme.colors.onSurface
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {form.category || 'Selecciona una categoría'}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.selectIcon,
                    {
                      color: theme.colors.onSurfaceVariant,
                      transform: [{ rotate: categoryMenuVisible ? '180deg' : '0deg' }],
                    },
                  ]}
                >
                  ▼
                </Text>
              </View>
            </TouchableRipple>
            {categoryMenuVisible && (
              <View
                style={[
                  styles.categoryDropdown,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outline,
                  },
                ]}
              >
                <ScrollView
                  style={styles.categoryScrollView}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {CATEGORIES.map((cat, index) => (
                    <TouchableRipple
                      key={cat}
                      onPress={() => {
                        setForm((s) => ({ ...s, category: cat }));
                        setCategoryMenuVisible(false);
                      }}
                      style={[
                        styles.categoryItem,
                        index !== CATEGORIES.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.outline + '40',
                        },
                        form.category === cat && {
                          backgroundColor: theme.colors.primaryContainer,
                        },
                      ]}
                    >
                      <Text
                        variant="bodyMedium"
                        style={[
                          styles.categoryItemText,
                          {
                            color:
                              form.category === cat
                                ? theme.colors.onPrimaryContainer
                                : theme.colors.onSurface,
                            fontWeight: form.category === cat ? '600' : '400',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableRipple>
                  ))}
                </ScrollView>
              </View>
            )}
            {errors.category && (
              <Text
                variant="bodySmall"
                style={[styles.error, { color: theme.colors.error }]}
              >
                {errors.category}
              </Text>
            )}
          </View>

          {/* Descripción */}
          <View style={styles.field}>
            <Text
              variant="bodyMedium"
              style={[styles.label, { color: theme.colors.onSurface }]}
            >
              Descripción (Opcional)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Describe tu meta"
              value={form.description}
              onChangeText={(text) => setForm((s) => ({ ...s, description: text }))}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </View>

          {/* Monto Objetivo */}
          <View style={styles.field}>
            <Text
              variant="bodyMedium"
              style={[styles.label, { color: theme.colors.onSurface }]}
            >
              Monto Objetivo ($)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="3000"
              value={form.targetAmount}
              onChangeText={(text) => setForm((s) => ({ ...s, targetAmount: text }))}
              keyboardType="numeric"
              error={!!errors.targetAmount}
              style={styles.input}
            />
            {errors.targetAmount && (
              <Text
                variant="bodySmall"
                style={[styles.error, { color: theme.colors.error }]}
              >
                {errors.targetAmount}
              </Text>
            )}
          </View>

          {/* Fecha Límite */}
          <View style={styles.field}>
            <Text
              variant="bodyMedium"
              style={[styles.label, { color: theme.colors.onSurface }]}
            >
              Fecha Límite
            </Text>
            <Pressable
              onPress={() => {
                if (form.deadline) {
                  setSelectedDate(parseYMDToDate(form.deadline));
                } else {
                  setSelectedDate(new Date());
                }
                setShowDatePicker(true);
              }}
            >
              <View
                style={[
                  styles.dateContainer,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: errors.deadline ? theme.colors.error : theme.colors.outline,
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.dateText,
                    {
                      color: form.deadline
                        ? theme.colors.onSurface
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {form.deadline
                    ? formatDateShort(form.deadline)
                    : 'Selecciona una fecha'}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.selectIcon, { color: theme.colors.primary }]}
                >
                  📅
                </Text>
              </View>
            </Pressable>
            {errors.deadline && (
              <Text
                variant="bodySmall"
                style={[styles.error, { color: theme.colors.error }]}
              >
                {errors.deadline}
              </Text>
            )}
            {Platform.OS !== 'web' && showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (event.type === 'set' && date) {
                    setSelectedDate(date);
                    const formatted = formatDateToYMD(date);
                    setForm((s) => ({ ...s, deadline: formatted }));
                  }
                }}
              />
            )}
            {Platform.OS === 'web' && (
              <TextInput
                mode="outlined"
                placeholder="YYYY-MM-DD"
                value={form.deadline}
                onChangeText={(text) => setForm((s) => ({ ...s, deadline: text }))}
                error={!!errors.deadline}
                style={styles.input}
                keyboardType="default"
              />
            )}
          </View>

          {/* Botón */}
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              onPress={handleSubmit}
              disabled={!isButtonEnabled()}
              loading={false}
              fullWidth
            >
              {isEdit ? 'Guardar cambios' : 'Crear Meta'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 600,
  },
  content: {
    padding: 16,
  },
  hint: {
    marginBottom: 16,
    opacity: 0.7,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  touchableRipple: {
    borderRadius: 4,
    marginBottom: 8,
  },
  selectContainer: {
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  selectText: {
    flex: 1,
  },
  selectIcon: {
    fontSize: 12,
    marginLeft: 8,
  },
  categoryDropdown: {
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 240,
    overflow: 'hidden',
  },
  categoryScrollView: {
    maxHeight: 240,
  },
  categoryItem: {
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  categoryItemText: {
    fontSize: 14,
  },
  dateContainer: {
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  dateText: {
    flex: 1,
  },
  error: {
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
});

