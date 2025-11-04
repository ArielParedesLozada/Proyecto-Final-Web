import React from 'react';
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

export default function BarChartView({
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

  // Preparar labels para el eje X - truncar para mejor espaciado
  const labels = data.map((item, index) => {
    const label = String(item[labelKey] || '');
    // Si el label es muy largo, truncarlo
    if (label.length > 8) {
      // Para nombres de metas, mostrar primeros 7 caracteres
      return label.substring(0, 7) + '...';
    }
    // Para fechas, formatear mejor si es posible
    if (label.length >= 7 && label.includes('-')) {
      // Formato YYYY-MM: mostrar MM/YY
      const parts = label.split('-');
      if (parts.length >= 2) {
        return `${parts[1]}/${parts[0].substring(2)}`;
      }
    }
    return label;
  });

  // Preparar datasets con colores específicos para cada barra
  const datasets = dataKeys.map((dk) => {
    const dataset: any = {
      data: data.map((item) => {
        const val = item[dk.key];
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val; 
        const numVal = parseFloat(String(val));
        return isNaN(numVal) ? 0 : numVal;
      }),
    };
    
    // Si hay un solo dataset, usar colores diferentes para cada barra (como Top 5 metas)
    if (dataKeys.length === 1 && data.length > 0) {
      // Generar colores diferentes para cada barra (rotación de colores)
      const colorPalette = [
        '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#84CC16'
      ];
      // react-native-chart-kit espera colors como array de funciones
      dataset.colors = data.map((_, index) => {
        const color = colorPalette[index % colorPalette.length];
        return (opacity = 1) => {
          // Convertir hex a rgba con opacidad
          const hex = color.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        };
      });
    } else {
      const hex = dk.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Crear un array de funciones con el mismo color para todas las barras
      dataset.colors = data.map(() => (opacity = 1) => `rgba(${r}, ${g}, ${b}, ${opacity})`);
      
      // También mantener la propiedad color como fallback
      dataset.color = (opacity = 1) => `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return dataset;
  });

  const chartData = {
    labels,
    datasets,
    legend: dataKeys.map((dk) => dk.label),
  };


  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 3, // Permitir más decimales para mostrar valores exactos, especialmente valores pequeños
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
        // Para valores de dinero, redondear al múltiplo de 1000 más cercano
        if (num === 0) return '0';
        const rounded = Math.round(num / 1000) * 1000;
        const finalValue = rounded === 0 && num > 0 ? 1000 : rounded;
        // Retornar solo el número sin $ ya que yAxisLabel lo agrega
        // Asegurar que siempre muestre comas para miles (usar formato inglés)
        return finalValue.toLocaleString('en-US');
      }
      
      if (type === 'percentage') {
        // Para porcentajes, redondear al múltiplo de 25 más cercano (0, 25, 50, 75, 100)
        const rounded = Math.round(num / 25) * 25;
        // Retornar solo el número sin % ya que yAxisSuffix lo agrega
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
      {/* Nota: react-native-chart-kit BarChart no soporta onDataPointClick */}
      {/* Los tooltips están disponibles solo para LineChart */}
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

