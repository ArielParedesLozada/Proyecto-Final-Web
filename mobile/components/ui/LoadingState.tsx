import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

export type LoadingStateProps = {
  message?: string;
  indicatorSize?: 'small' | 'large';
  spinnerColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
};

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando...',
  indicatorSize = 'large',
  spinnerColor,
  containerStyle,
  messageStyle,
  backgroundColor,
}) => {
  const theme = useTheme();
  const resolvedSpinnerColor = spinnerColor ?? theme.colors.primary;
  const resolvedBackground = backgroundColor ?? theme.colors.background;

  return (
    <View style={[styles.container, { backgroundColor: resolvedBackground }, containerStyle]}>
      <ActivityIndicator size={indicatorSize} color={resolvedSpinnerColor} />
      {message ? (
        <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }, messageStyle]}>{message}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
});

export default LoadingState;

