import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateToYMD, parseYMDToDate, formatDateShort } from '@/utils/date';

export interface DateFieldProps {
    label: string;
    value?: string; // YYYY-MM-DD
    onChange: (ymd: string) => void;
}

export default function DateField({ label, value, onChange }: DateFieldProps) {
    const theme = useTheme();
    const [show, setShow] = useState(false);
    const [date, setDate] = useState<Date>(value ? parseYMDToDate(value) : new Date());

    const open = () => {
        if (value) setDate(parseYMDToDate(value));
        setShow(true);
    };

    const handleChange = (event: any, picked?: Date) => {
        setShow(Platform.OS === 'ios');
        if (event.type === 'set' && picked) {
            onChange(formatDateToYMD(picked));
        }
    };

    return (
        <View style={styles.field}>
            <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                {label}
            </Text>
            <Pressable onPress={open}>
                <View
                    style={[
                        styles.dateContainer,
                        { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
                    ]}
                >
                    <Text
                        variant="bodyMedium"
                        style={[
                            styles.dateText,
                            { color: value ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
                        ]}
                    >
                        {value ? formatDateShort(value) : 'dd/mm/aaaa'}
                    </Text>
                    <MaterialIcons name="calendar-today" size={18} color={theme.colors.primary} />
                </View>
            </Pressable>

            {Platform.OS !== 'web' && show && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    field: { flex: 1, minWidth: 120 },
    label: { marginBottom: 6, fontWeight: '500' },
    dateContainer: {
        borderRadius: 4,
        padding: 10,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 40,
    },
    dateText: { flex: 1 },
});
