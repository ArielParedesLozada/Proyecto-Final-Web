import React from 'react';
import { Pressable, StyleSheet, View, Text, ViewStyle } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';

interface GoogleAuthButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function GoogleAuthButton({
  onPress,
  loading = false,
  disabled = false,
  style,
}: GoogleAuthButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.colors.outline, backgroundColor: theme.colors.background },
        pressed && !loading ? styles.pressed : null,
        disabled || loading ? styles.disabled : null,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size={20} color={theme.colors.primary} />
        ) : (
          <AntDesign name="google" size={20} color="#4285F4" />
        )}
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Continuar con Google</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});


