import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';

export interface BarChartDataPoint {
  [key: string]: string | number | undefined;
}

export interface BarChartViewProps {
  data: Array<Record<string, string | number | undefined>>;
  dataKeys: { key: string; label: string; color: string }[];
  labelKey: string;
  valueFormatter?: (value: number) => string;
  yAxisType?: 'money' | 'percentage' | 'number';
}

const CHART_HEIGHT = 260;
const CHART_WIDTH = Dimensions.get('window').width - 64;

function BarChartViewComponent({
  data,
  dataKeys,
  labelKey,
  valueFormatter = (v) => v.toString(),
  yAxisType,
}: BarChartViewProps) {
  const theme = useTheme();

  if (data.length === 0) {
    return null;
  }

  const labels: string[] = [];
  const dataPoints: number[] = [];
  const barColors: Array<(opacity?: number) => string> = [];

  const labelFromRaw = (raw: string) => {
    if (raw.length >= 7 && raw.includes('-')) {
      const parts = raw.split('-');
      if (parts.length >= 2) {
        return `${parts[1]}/${parts[0].substring(2)}`;
      }
    }
    return raw.length > 6 ? `${raw.substring(0, 6)}…` : raw;
  };

  data.forEach((item) => {
    const rawLabel = String(item[labelKey] || '');
    const baseLabel = labelFromRaw(rawLabel);

    dataKeys.forEach((dk, idx) => {
      const value = item[dk.key];
      const numeric = typeof value === 'number' ? value : parseFloat(String(value));
      const safeValue = Number.isFinite(numeric) ? Math.abs(numeric) : 0;

      labels.push(idx === 0 ? baseLabel : '');
      dataPoints.push(safeValue);

      const hex = dk.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      barColors.push((opacity = 1) => `rgba(${r}, ${g}, ${b}, ${opacity})`);
    });
  });

  if (labels.length === 0) {
    return null;
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: dataPoints,
        colors: barColors,
      },
    ],
    legend: dataKeys.map((dk) => dk.label),
  };

  const allValues = dataPoints;
  const rawMaxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
  const maxValue = rawMaxValue <= 0 ? 1 : rawMaxValue;


  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces:
      yAxisType === 'money'
        ? maxValue < 10
          ? 2
          : maxValue < 100
          ? 1
          : 0
        : yAxisType === 'percentage'
        ? maxValue < 10
          ? 1
          : 0
        : 2,
    color: (opacity = 1) => theme.colors.onSurface,
    labelColor: (opacity = 1) => theme.colors.onSurfaceVariant,
    style: {
      borderRadius: 16,
    },
    formatYLabel: (yLabel: string) => {
      const num = Number(yLabel);
      if (isNaN(num)) return yLabel;
      
      // Usar yAxisType si está disponible, sino intentar detectar desde formatter
      let type = yAxisType;
      if (!type) {
        const formatterStr = valueFormatter.toString();
        if (formatterStr.includes('$')) type = 'money';
        else if (formatterStr.includes('%')) type = 'percentage';
      }
      
      if (type === 'money') {
        if (num === 0) return '0';

        if (maxValue >= 1_000_000) {
          const divided = num / 1_000_000;
          return `${divided.toFixed(maxValue >= 10_000_000 ? 0 : 1)}M`;
        }

        if (maxValue >= 10_000) {
          const divided = num / 1_000;
          return `${divided.toFixed(maxValue >= 100_000 ? 0 : 1)}K`;
        }

        const fractionDigits = maxValue < 10 ? 2 : maxValue < 100 ? 1 : 0;
        return num.toLocaleString('en-US', {
          maximumFractionDigits: fractionDigits,
          minimumFractionDigits: 0,
        });
      }
      
      if (type === 'percentage') {
        const rounded = Math.round(num / 25) * 25;
        return rounded.toString();
      }
      
      return valueFormatter(num);
    },
    barPercentage: dataKeys.length > 1 ? 0.5 : 0.6,
    propsForBackgroundLines: {
      strokeDasharray: '5,5',
      stroke: theme.colors.outline,
      strokeOpacity: 0.3,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          chartConfig={chartConfig}
          style={styles.chart}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withInnerLines={true}
          fromZero={true}
          showValuesOnTopOfBars={false}
          yAxisLabel={yAxisType === 'money' ? '$' : ''}
          yAxisSuffix={yAxisType === 'percentage' ? '%' : ''}
          segments={4}
          withCustomBarColorFromData={true}
          flatColor={true}
        />
      </View>
      <View style={styles.legend}>
        {dataKeys.map((dk) => (
          <View key={dk.key} style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: dk.color }]} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
              {dk.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default memo(BarChartViewComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

