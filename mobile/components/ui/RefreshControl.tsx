import React from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native';
import { useTheme } from 'react-native-paper';

export interface RefreshControlComponentProps extends Omit<RefreshControlProps, 'tintColor' | 'colors'> {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function RefreshControl({
  refreshing,
  onRefresh,
  ...props
}: RefreshControlComponentProps) {
  const theme = useTheme();

  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.primary}
      colors={[theme.colors.primary]}
      {...props}
    />
  );
}

