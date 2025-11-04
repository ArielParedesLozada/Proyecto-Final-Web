import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableWithoutFeedback,
    Dimensions,
    Modal,
    Platform,
} from 'react-native';
import { Text, TouchableRipple, useTheme, Portal } from 'react-native-paper';
import { Goal } from '@/services/goals';

type Rect = { x: number; y: number; width: number; height: number };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export interface GoalSelectProps {
    goals: Goal[];
    selectedGoal: Goal | null;
    onChange: (goal: Goal) => void;
    loading?: boolean;
    label?: string;
}

export default function GoalSelect({
    goals,
    selectedGoal,
    onChange,
    loading = false,
    label = 'Meta:',
}: GoalSelectProps) {
    const theme = useTheme();
    const selectRef = useRef<View>(null);

    const [visible, setVisible] = useState(false);
    const [anchor, setAnchor] = useState<Rect | null>(null);

    const measureAnchor = () => {
        selectRef.current?.measureInWindow?.((x, y, width, height) => {
            setAnchor({ x, y, width, height });
        });
    };

    const open = () => {
        if (loading || goals.length === 0) return;
        measureAnchor();
        setVisible(true);
    };

    const close = () => setVisible(false);

    useEffect(() => {
        const sub = Dimensions.addEventListener('change', () => {
            if (visible) requestAnimationFrame(measureAnchor);
        });
        return () => {
            // RN < 0.71 compat
            // @ts-ignore
            sub?.remove?.();
        };
    }, [visible]);

    // Cálculo de posición del dropdown
    const windowW = Dimensions.get('window').width;
    const windowH = Dimensions.get('window').height;
    const SCREEN_PADDING = 8;
    const DROPDOWN_MAX_HEIGHT = 320;
    const GAP = 4;

    let dropdownPos: any = {};
    if (anchor) {
        const width = clamp(anchor.width, 160, windowW - SCREEN_PADDING * 2);
        const left = clamp(anchor.x, SCREEN_PADDING, windowW - SCREEN_PADDING - width);
        const preferredTop = anchor.y + anchor.height + GAP;
        const spaceBelow = windowH - preferredTop - SCREEN_PADDING;
        const openUpwards = spaceBelow < 140;

        const top = openUpwards
            ? clamp(anchor.y - GAP - DROPDOWN_MAX_HEIGHT, SCREEN_PADDING, windowH - SCREEN_PADDING)
            : preferredTop;

        dropdownPos = { position: 'absolute', top, left, width, maxHeight: DROPDOWN_MAX_HEIGHT };
    }

    return (
        <View style={styles.field}>
            <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                {label}
            </Text>

            <TouchableRipple
                onPress={open}
                disabled={loading || goals.length === 0}
                rippleColor={theme.colors.primary + '20'}
                style={styles.touchableRipple}
            >
                <View
                    ref={selectRef}
                    style={[
                        styles.selectContainer,
                        { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
                    ]}
                    onLayout={() => visible && requestAnimationFrame(measureAnchor)}
                >
                    <Text
                        variant="bodyMedium"
                        style={[
                            styles.selectText,
                            { color: selectedGoal ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
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
                                transform: [{ rotate: visible ? '180deg' : '0deg' }],
                            },
                        ]}
                    >
                        ▼
                    </Text>
                </View>
            </TouchableRipple>

            {/* Dropdown en Portal */}
            <Portal>
                <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
                    <TouchableWithoutFeedback onPress={close}>
                        <View style={styles.modalOverlay} />
                    </TouchableWithoutFeedback>

                    {anchor && (
                        <View
                            style={[
                                styles.dropdown,
                                dropdownPos,
                                { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
                            ]}
                        >
                            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator style={{ maxHeight: 320 }}>
                                {goals.map((goal, i) => {
                                    const selected = selectedGoal?.id === goal.id;
                                    return (
                                        <TouchableRipple
                                            key={goal.id}
                                            onPress={() => {
                                                onChange(goal);
                                                close();
                                            }}
                                            style={[
                                                styles.dropdownItem,
                                                i !== goals.length - 1 && {
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: theme.colors.outline + '40',
                                                },
                                                selected && { backgroundColor: theme.colors.primaryContainer },
                                            ]}
                                        >
                                            <Text
                                                variant="bodyMedium"
                                                style={{
                                                    color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                                                    fontWeight: selected ? '600' : '400',
                                                }}
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
        </View>
    );
}

const styles = StyleSheet.create({
    field: { flex: 1, minWidth: 120 },
    label: { marginBottom: 6, fontWeight: '500' },
    touchableRipple: { borderRadius: 4, marginBottom: 8 },
    selectContainer: {
        borderRadius: 4,
        padding: 8,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 40,
    },
    selectText: { flex: 1, fontSize: 14 },
    selectIcon: { fontSize: 12, marginLeft: 8 },

    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
    dropdown: {
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
    dropdownItem: { padding: 12, minHeight: 48, justifyContent: 'center' },
});
