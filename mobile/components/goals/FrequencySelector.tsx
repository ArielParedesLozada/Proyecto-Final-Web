import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';

export interface FrequencySelectorProps {
  value: 'daily' | 'weekly' | 'monthly';
  onChange: (frequency: 'daily' | 'weekly' | 'monthly') => void;
  disabled?: boolean;
  error?: string;
  label?: string;
}

const FREQUENCIES = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'daily', label: 'Diaria' },
];

export default function FrequencySelector({
  value,
  onChange,
  disabled = false,
  error,
  label = 'Frecuencia',
}: FrequencySelectorProps) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.section}>
      <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
      <TouchableRipple
        onPress={() => !disabled && setMenuVisible(!menuVisible)}
        rippleColor={theme.colors.primary + '20'}
        style={styles.touchableRipple}
        disabled={disabled}
      >
        <View
          style={[
            styles.selectContainer,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: error ? theme.colors.error : theme.colors.outline,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Text
            variant="bodyMedium"
            style={[
              styles.selectText,
              {
                color: value ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {value ? FREQUENCIES.find((f) => f.value === value)?.label : 'Seleccionar una frecuencia'}
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.selectIcon,
              {
                color: theme.colors.onSurfaceVariant,
                transform: [{ rotate: menuVisible ? '180deg' : '0deg' }],
              },
            ]}
          >
            ▼
          </Text>
        </View>
      </TouchableRipple>
      {menuVisible && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <ScrollView
            style={styles.dropdownScroll}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {FREQUENCIES.map((freq, index) => (
              <TouchableRipple
                key={freq.value}
                onPress={() => {
                  onChange(freq.value as 'daily' | 'weekly' | 'monthly');
                  setMenuVisible(false);
                }}
                style={[
                  styles.item,
                  index !== FREQUENCIES.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outline + '40',
                  },
                  value === freq.value && {
                    backgroundColor: theme.colors.primaryContainer,
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.itemText,
                    {
                      color:
                        value === freq.value
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurface,
                      fontWeight: value === freq.value ? '600' : '400',
                    },
                  ]}
                >
                  {freq.label}
                </Text>
              </TouchableRipple>
            ))}
          </ScrollView>
        </View>
      )}
      {error && (
        <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  touchableRipple: {
    borderRadius: 4,
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
  dropdown: {
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 240,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  item: {
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 14,
  },
  error: {
    marginTop: 4,
  },
});

