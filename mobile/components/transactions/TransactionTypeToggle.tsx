import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface TransactionTypeToggleProps {
    value: 'Fijo' | 'Variable' | null;
    onChange: (next: 'Fijo' | 'Variable' | null) => void;
    label?: string;
}

export default function TransactionTypeToggle({
    value,
    onChange,
    label = 'Tipo:',
}: TransactionTypeToggleProps) {
    const theme = useTheme();

    const toggle = (type: 'Fijo' | 'Variable') => {
        onChange(value === type ? null : type);
    };

    return (
        <View style={styles.field}>
            <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                {label}
            </Text>
            <View style={styles.typeContainer}>
                {(['Fijo', 'Variable'] as const).map((type) => {
                    const active = value === type;
                    return (
                        <Pressable
                            key={type}
                            onPress={() => toggle(type)}
                            style={[
                                styles.typeButton,
                                {
                                    backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant,
                                    borderColor: active ? theme.colors.primary : theme.colors.outline,
                                },
                            ]}
                        >
                            <Text
                                variant="bodySmall"
                                style={{
                                    color: active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                                    fontWeight: active ? '600' : '400',
                                }}
                            >
                                {type}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    field: { flex: 1, minWidth: 120 },
    label: { marginBottom: 6, fontWeight: '500' },
    typeContainer: { flexDirection: 'row', gap: 6 },
    typeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
