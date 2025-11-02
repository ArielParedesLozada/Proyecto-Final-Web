import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Modal, Button } from '@/components/ui';
import { Goal, AddTransactionPayload } from '@/services/goals';
import {
  listFixedMovements,
  updateFixedMovement,
  deleteFixedMovement,
  FixedMovement,
} from '@/services/fixedMovements';
import TransactionTypeSelector from './TransactionTypeSelector';
import TransactionKindSelector from './TransactionKindSelector';
import FrequencySelector from './FrequencySelector';
import LockedRuleDisplay from './LockedRuleDisplay';
import EditRuleForm from './EditRuleForm';
import AmountInput from './AmountInput';

export interface AddTransactionModalProps {
  visible: boolean;
  onDismiss: () => void;
  goal: Goal | null;
  onSubmit: (payload: AddTransactionPayload & { goalId: number }) => Promise<void>;
  initialType?: 'income' | 'expense';
}

export default function AddTransactionModal({
  visible,
  onDismiss,
  goal,
  onSubmit,
  initialType,
}: AddTransactionModalProps) {
  const theme = useTheme();

  const [type, setType] = useState<'income' | 'expense' | ''>('');
  const [kind, setKind] = useState<'Variable' | 'Fijo' | ''>('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Estados para reglas fijas
  const [lockedFixed, setLockedFixed] = useState(false);
  const [lockedInfo, setLockedInfo] = useState<FixedMovement | null>(null);
  const [editRuleOpen, setEditRuleOpen] = useState(false);
  const [editRuleAmount, setEditRuleAmount] = useState('');
  const [editRuleFreq, setEditRuleFreq] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [savingRule, setSavingRule] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingRule, setDeletingRule] = useState(false);

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (!visible) {
      setType('');
      setKind('');
      setFrequency('monthly');
      setAmount('');
      setErrors({});
      setLockedFixed(false);
      setLockedInfo(null);
      setEditRuleOpen(false);
      setSavingRule(false);
      setConfirmDeleteOpen(false);
      setDeletingRule(false);
    } else if (initialType && initialType !== type) {
      // Si se pasa initialType, inicializar con ese tipo
      handleTypeChange(initialType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialType]);

  // Verificar reglas fijas cuando cambia el tipo
  const handleTypeChange = async (nextType: 'income' | 'expense') => {
    // Primero resetear completamente el estado del tipo anterior
    setLockedFixed(false);
    setLockedInfo(null);
    setEditRuleOpen(false);
    setKind('Variable');
    setFrequency('monthly');
    setAmount('');
    setErrors({});
    setType(nextType);

    try {
      if (!goal?.id) return;
      
      // Verificar si existe regla fija solo para el nuevo tipo (income o expense son independientes)
      const res = await listFixedMovements(goal.id, { type: nextType });
      const rule = Array.isArray(res?.data) ? res.data[0] : null;

      if (rule) {
        // Existe regla fija para este tipo específico
        setLockedFixed(true);
        setLockedInfo(rule);
        setKind('Fijo');
        setFrequency(rule.frequency);
        setAmount(String(rule.amount));
        setEditRuleAmount(String(rule.amount));
        setEditRuleFreq(rule.frequency);
      } else {
        // No existe regla fija para este tipo, permitir crear Variable o Fijo
        setLockedFixed(false);
        setLockedInfo(null);
        setEditRuleOpen(false);
        setKind('Variable'); // Por defecto Variable
        setAmount('');
      }
    } catch (error) {
      // En caso de error, permitir crear normalmente
      setLockedFixed(false);
      setLockedInfo(null);
      setEditRuleOpen(false);
      setKind('Variable');
    }
  };

  const target = Number(goal?.target_amount ?? 0);
  const current = Math.max(0, Number(goal?.accumulated ?? goal?.current_amount ?? 0));

  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  const disabledInputs = !type;

  const nAmount = Number(amount || 0);
  const expenseTooHigh = isExpense && nAmount > 0 && nAmount > current;

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    const numAmount = Number(amount);

    if (!type) e.type = 'Selecciona Ingreso o Gasto';
    if (!kind && !lockedFixed) e.kind = 'Selecciona el tipo (Fijo/Variable)';

    if (!lockedFixed) {
      if (!amount || numAmount <= 0) {
        e.amount = 'Monto inválido';
      } else if (isExpense && numAmount > current) {
        e.amount = `El gasto excede tu saldo disponible ($${current.toLocaleString()}).`;
      }
    }

    if ((kind === 'Fijo' || lockedFixed) && !frequency) {
      e.frequency = 'Selecciona una frecuencia';
    }

    return e;
  };

  const handleSubmit = async () => {
    // Si hay regla fija bloqueada, no permitir registrar nada
    if (lockedFixed) {
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!goal?.id || !type || !kind) return;

    setSubmitting(true);
    try {
      const payload: AddTransactionPayload & { goalId: number } = {
        goalId: goal.id,
        type: type as 'income' | 'expense',
        amount: nAmount,
        is_fixed: kind === 'Fijo',
        frequency: kind === 'Fijo' ? frequency : undefined,
      };

      await onSubmit(payload);
      onDismiss();
    } catch (error: any) {
      console.error('Error al guardar transacción:', error);
      setErrors({ submit: error.message || 'Error al guardar la transacción' });
    } finally {
      setSubmitting(false);
    }
  };

  // Actualizar regla fija
  const handleUpdateRule = async () => {
    if (!lockedInfo?.id) return;
    const nAmt = Number(editRuleAmount || 0);
    if (!nAmt || nAmt <= 0) return;

    setSavingRule(true);
    try {
      await updateFixedMovement(lockedInfo.id, {
        amount: nAmt,
        frequency: editRuleFreq,
        reseed_next_run: true,
      });

      // Actualizar UI
      setLockedInfo((s) => s && { ...s, amount: nAmt, frequency: editRuleFreq });
      setFrequency(editRuleFreq);
      setAmount(String(nAmt));
      setEditRuleOpen(false);
    } catch (error: any) {
      console.error('Error al actualizar regla:', error);
      setErrors({ submit: error.message || 'Error al actualizar la regla' });
    } finally {
      setSavingRule(false);
    }
  };

  // Eliminar regla fija
  const handleDeleteRule = async () => {
    if (!lockedInfo?.id) return;
    setDeletingRule(true);
    try {
      await deleteFixedMovement(lockedInfo.id);

      // Limpiar todo lo relacionado a la regla
      setConfirmDeleteOpen(false);
      setLockedFixed(false);
      setLockedInfo(null);
      setEditRuleOpen(false);

      // Volver a Variable por defecto
      setKind('Variable');
      setFrequency('monthly');
      setAmount('');
      setErrors((e) => {
        const newErrors = { ...e };
        delete newErrors.frequency;
        return newErrors;
      });
    } catch (error: any) {
      console.error('Error al eliminar regla:', error);
      setErrors({ submit: error.message || 'Error al eliminar la regla' });
    } finally {
      setDeletingRule(false);
    }
  };

  const canSubmit =
    !!type &&
    !lockedFixed &&
    !!kind &&
    nAmount > 0 &&
    !(isExpense && expenseTooHigh) &&
    !(kind === 'Fijo' && !frequency);

  const getFrequencyLabel = (freq: 'daily' | 'weekly' | 'monthly') => {
    if (freq === 'daily') return 'Diaria';
    if (freq === 'weekly') return 'Semanal';
    return 'Mensual';
  };

  const frequencyLabel = lockedInfo?.frequency
    ? getFrequencyLabel(lockedInfo.frequency)
    : getFrequencyLabel(frequency);

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      title={`Agregar ${isIncome ? 'Ingreso' : isExpense ? 'Gasto' : 'Ingreso/Gasto'}`}
      cancelable
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {goal?.name && (
          <Text
            variant="bodySmall"
            style={[styles.goalInfo, { color: theme.colors.onSurfaceVariant }]}
          >
            Meta: <Text style={{ fontWeight: '600' }}>{goal.name}</Text>
          </Text>
        )}

        <TransactionTypeSelector
          type={type}
          onTypeChange={handleTypeChange}
          error={errors.type}
        />

        {type && (
          <View style={styles.balanceInfo}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Saldo disponible: <Text style={{ fontWeight: '600' }}>${current.toLocaleString()}</Text>
              {' | '}
              Objetivo: <Text style={{ fontWeight: '600' }}>${target.toLocaleString()}</Text>
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
            Tipo
          </Text>

          {lockedFixed ? (
            <>
              {!editRuleOpen ? (
                <LockedRuleDisplay
                  type={type as 'income' | 'expense'}
                  frequencyLabel={frequencyLabel}
                  amount={Number(lockedInfo?.amount || 0)}
                  onEdit={() => setEditRuleOpen(true)}
                  onDelete={() => setConfirmDeleteOpen(true)}
                />
              ) : (
                <EditRuleForm
                  frequency={editRuleFreq}
                  amount={editRuleAmount}
                  onFrequencyChange={setEditRuleFreq}
                  onAmountChange={setEditRuleAmount}
                  onSave={handleUpdateRule}
                  onCancel={() => setEditRuleOpen(false)}
                  saving={savingRule}
                />
              )}
            </>
          ) : (
            <TransactionKindSelector
              kind={kind}
              onKindChange={setKind}
              disabled={disabledInputs || lockedFixed}
              error={errors.kind}
            />
          )}
        </View>

        {kind === 'Fijo' && !lockedFixed && type && (
          <FrequencySelector
            value={frequency}
            onChange={(freq) => {
              setFrequency(freq);
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.frequency;
                return newErrors;
              });
            }}
            error={errors.frequency}
          />
        )}

        {!lockedFixed && (
          <AmountInput
            value={amount}
            onChange={setAmount}
            type={type as 'income' | 'expense'}
            disabled={disabledInputs}
            error={
              errors.amount || (expenseTooHigh ? `El gasto excede tu saldo disponible ($${current.toLocaleString()}).` : undefined)
            }
          />
        )}

        {errors.submit && (
          <Text variant="bodySmall" style={[styles.submitError, { color: theme.colors.error }]}>
            {errors.submit}
          </Text>
        )}

        {/* Botón Guardar - solo mostrar si NO hay regla fija bloqueada */}
        {!lockedFixed && (
          <View style={styles.actions}>
            <Button
              variant="primary"
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              loading={submitting}
              style={styles.submitButton}
            >
              Guardar
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmación para eliminar regla */}
      <Modal
        visible={confirmDeleteOpen}
        onDismiss={() => setConfirmDeleteOpen(false)}
        title="Eliminar regla fija"
        message="¿Seguro que deseas eliminar esta regla fija? Esta acción no se puede deshacer."
        primaryAction={{
          label: deletingRule ? 'Eliminando…' : 'Sí, eliminar',
          onPress: handleDeleteRule,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setConfirmDeleteOpen(false),
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 600,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  goalInfo: {
    marginBottom: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceInfo: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  submitError: {
    textAlign: 'center',
    marginVertical: 8,
  },
  actions: {
    marginTop: 8,
    marginBottom: 16,
  },
  submitButton: {
    width: '100%',
  },
});

