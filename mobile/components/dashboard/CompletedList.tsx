import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatYMDToShort } from '@/utils/date';

export interface CompletedItem {
  id: number;
  name: string;
  finishedAt?: string;
  deadline?: string;
}

export interface CompletedListProps {
  items: CompletedItem[];
}

export default function CompletedList({ items }: CompletedListProps) {
  const theme = useTheme();

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: theme.colors.outline }]} />
      {items.map((item, index) => (
        <View key={item.id} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          <View style={styles.content}>
            <Text
              variant="bodyMedium"
              style={[styles.name, { color: theme.colors.onSurface }]}
            >
              {item.name}
            </Text>
            {(item.finishedAt || item.deadline) && (
              <Text
                variant="bodySmall"
                style={[styles.date, { color: theme.colors.onSurfaceVariant }]}
              >
                {formatYMDToShort(item.finishedAt || item.deadline || '')}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 12,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 6,
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingLeft: 16,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    left: 0,
    top: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  name: {
    fontWeight: '500',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
  },
});

