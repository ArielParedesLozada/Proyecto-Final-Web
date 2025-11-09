import React, { useState, memo } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Text, useTheme, Portal } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import ChartTooltip from './ChartTooltip';

export interface LineChartDataPoint {
  month?: string;
  [key: string]: string | number | undefined;
}

export interface LineChartViewProps {
  data: Array<Record<string, string | number | undefined>>;
  dataKeys: { key: string; label: string; color: string }[];
  valueFormatter?: (value: number) => string;
  yAxisType?: 'money' | 'percentage' | 'number';
}

const CHART_HEIGHT = 260;
const CHART_WIDTH = Dimensions.get('window').width - 64;

function LineChartViewComponent({
  data,
  dataKeys,
  valueFormatter = (v) => v.toString(),
  yAxisType,
}: LineChartViewProps) {
  const theme = useTheme();
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    label: string;
    values: Array<{ label: string; value: number; color: string; formatted: string }>;
  }>({
    visible: false,
    x: 0,
    y: 0,
    label: '',
    values: [],
  });

  if (data.length === 0) {
    return null;
  }

  // Preparar labels para el eje X - limitar a máximo 6 labels para mejor espaciado
  const maxLabels = 6;
  let labels: string[];
  let filteredData: typeof data;
  
  if (data.length <= maxLabels) {
    // Si hay 6 o menos datos, mostrar todos
    filteredData = data;
    labels = data.map((item) => {
      const month = (item.month || item['month'] || '') as string;
      if (month.length >= 7) {
        // Formato YYYY-MM: mostrar MM/YY
        const year = month.substring(2, 4);
        const monthNum = month.substring(5, 7);
        return `${monthNum}/${year}`;
      }
      return month.length > 6 ? month.substring(0, 6) : month;
    });
  } else {
    // Si hay más de 6, mostrar primero, último y algunos intermedios
    const step = Math.floor((data.length - 1) / (maxLabels - 1));
    const indices = [0];
    for (let i = 1; i < maxLabels - 1; i++) {
      indices.push(i * step);
    }
    indices.push(data.length - 1);
    
    filteredData = indices.map(idx => data[idx]);
    labels = filteredData.map((item) => {
      const month = (item.month || item['month'] || '') as string;
      if (month.length >= 7) {
        const year = month.substring(2, 4);
        const monthNum = month.substring(5, 7);
        return `${monthNum}/${year}`;
      }
      return month.length > 6 ? month.substring(0, 6) : month;
    });
  }
  
  // Preparar datasets con los datos filtrados
  const filteredDatasets = dataKeys.map((dk) => ({
    data: filteredData.map((item) => {
      const val = item[dk.key];
      return Number(val) || 0;
    }),
    color: (opacity = 1) => dk.color,
    strokeWidth: 2,
  }));

  const allValues = filteredDatasets.flatMap((dataset) => dataset.data);
  const rawMaxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
  const maxValue = rawMaxValue <= 0 ? 1 : rawMaxValue;

  const chartData = {
    labels,
    datasets: filteredDatasets,
    // No incluir legend aquí para evitar duplicación - usamos nuestra propia leyenda personalizada
  };

  // Manejador para clicks en puntos de datos
  const handleDataPointClick = (data: any) => {
    if (!data || data.index === undefined) {
      setTooltip({ visible: false, x: 0, y: 0, label: '', values: [] });
      return;
    }

    const index = data.index;
    if (index < 0 || index >= filteredData.length) {
      setTooltip({ visible: false, x: 0, y: 0, label: '', values: [] });
      return;
    }

    const item = filteredData[index];
    const label = labels[index] || '';
    
    // Obtener todos los valores para este punto de datos
    const values = dataKeys.map((dk) => {
      const val = Number(item[dk.key]) || 0;
      return {
        label: dk.label,
        value: val,
        color: dk.color,
        formatted: valueFormatter(val),
      };
    });

    setTooltip({
      visible: true,
      x: data.x || 0,
      y: (data.y || 0) - 100, // Ajustar posición verticalmente
      label,
      values,
    });
  };

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
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: theme.colors.surface,
    },
    propsForBackgroundLines: {
      strokeDasharray: '5,5',
      stroke: theme.colors.outline,
      strokeOpacity: 0.3,
    },
    formatYLabel: (yLabel: string) => {
      // Limpiar el label si tiene caracteres no numéricos (como $)
      const cleanLabel = yLabel.toString().replace(/[^0-9.-]/g, '');
      const num = Number(cleanLabel);
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
        if (num === 0) return '0';

        if (maxValue <= 10) {
          const digits = maxValue < 1 ? 2 : 1;
          return Number(num.toFixed(digits)).toString();
        }

        const step = maxValue <= 50 ? 5 : 10;
        const rounded = Math.round(num / step) * step;
        const finalValue = Math.min(100, Math.max(0, rounded));

        if (finalValue === 0 && num > 0) {
          return step.toString();
        }

        return finalValue.toString();
      }
      
      return valueFormatter(num);
    },
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => setTooltip({ visible: false, x: 0, y: 0, label: '', values: [] })}>
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withInnerLines={true}
            withOuterLines={false}
          fromZero={true}
          segments={yAxisType === 'percentage' ? 5 : 4}
            yAxisLabel={yAxisType === 'money' ? '$' : ''}
            yAxisSuffix={yAxisType === 'percentage' ? '%' : ''}
            formatYLabel={(value) => chartConfig.formatYLabel(value)}
            onDataPointClick={handleDataPointClick}
          />
        </View>
      </TouchableWithoutFeedback>
      {tooltip.visible && (
        <Portal>
          <ChartTooltip
            visible={tooltip.visible}
            x={tooltip.x}
            y={tooltip.y}
            label={tooltip.label}
            values={tooltip.values}
          />
        </Portal>
      )}
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

export default memo(LineChartViewComponent);

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

