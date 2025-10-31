import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { TextInput, Text, useTheme, TextInputProps } from 'react-native-paper';

export interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry' | 'right'> {
  errorMessage?: string;
  helperText?: string;
  showPasswordIcon?: boolean;
  leftIcon?: string;
  containerStyle?: ViewStyle;
}

/**
 * Componente de input de contraseña reutilizable con mostrar/ocultar
 * 
 * @example
 * <PasswordInput
 *   label="Contraseña"
 *   value={password}
 *   onChangeText={setPassword}
 *   errorMessage={errors.password}
 *   helperText="Mínimo 8 caracteres"
 * />
 */
export default function PasswordInput({
  label = 'Contraseña',
  placeholder = '••••••••',
  value,
  onChangeText,
  errorMessage,
  helperText,
  showPasswordIcon = true,
  leftIcon = 'lock',
  containerStyle,
  style,
  ...props
}: PasswordInputProps) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        {...props}
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoComplete="password"
        error={!!errorMessage}
        style={[styles.input, style]}
        left={
          leftIcon ? (
            <TextInput.Icon icon={leftIcon} />
          ) : undefined
        }
        right={
          showPasswordIcon ? (
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          ) : undefined
        }
      />
      
      {helperText && !errorMessage && (
        <Text
          variant="bodySmall"
          style={[
            styles.helperText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {helperText}
        </Text>
      )}

      {errorMessage && (
        <Text
          variant="bodySmall"
          style={[
            styles.errorText,
            { color: theme.colors.error },
          ]}
        >
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
  },
  helperText: {
    marginTop: 4,
    marginBottom: 4,
  },
  errorText: {
    marginTop: 4,
    marginBottom: 4,
  },
});

