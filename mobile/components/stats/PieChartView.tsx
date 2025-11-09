import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';

export interface PieChartData {
  name: string;
  value: number;
}

export interface PieChartViewProps {
  data: PieChartData[];
  colors?: string[];
}

const DEFAULT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'];
const CHART_WIDTH = Dimensions.get('window').width - 64;

function PieChartViewComponent({ data, colors = DEFAULT_COLORS }: PieChartViewProps) {
  const theme = useTheme();

  if (data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  if (total === 0) {
    return null;
  }

  const filteredData = data.filter((item) => item.value > 0);
  if (filteredData.length === 0) {
    return null;
  }

  const chartData = filteredData.map((item, index) => ({
    name: '', 
    population: item.value,
    color: colors[index % colors.length],
    legendFontColor: 'transparent', 
    legendFontSize: 0,
  }));

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <PieChart
          data={chartData}
          width={CHART_WIDTH}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 10]}
          absolute
          hasLegend={false}
        />
      </View>
      <View style={styles.legend}>
        {filteredData.map((item, index) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          const count = item.value;
          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.colorDot, { backgroundColor: colors[index % colors.length] }]} />
              <View style={styles.legendText}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {item.name}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {percentage}% ({count})
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default memo(PieChartViewComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    gap: 12,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%', 
    maxWidth: '48%',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    flex: 1,
    gap: 2,
  },
});

