import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export interface Slide {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface SliderProps {
  slides: Slide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Componente Slider reutilizable para mostrar contenido deslizable
 * 
 * @example
 * <Slider
 *   slides={[
 *     { id: '1', title: 'Título', description: 'Descripción', icon: 'wallet' }
 *   ]}
 *   autoPlay
 *   showIndicators
 * />
 */
export default function Slider({
  slides,
  autoPlay = true,
  autoPlayInterval = 4000,
  showIndicators = true,
}: SliderProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % slides.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slides.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const scrollToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
      >
        {slides.map((slide, index) => {
          const slideColor = slide.color || theme.colors.primary;
          
          return (
            <View
              key={slide.id}
              style={[
                styles.slide,
                {
                  width: SCREEN_WIDTH,
                  backgroundColor: slideColor + '15', // Agregar transparencia
                },
              ]}
            >
              <View style={[styles.slideContent, { backgroundColor: theme.colors.surface }]}>
                {slide.icon && (
                  <View style={[styles.iconContainer, { backgroundColor: slideColor + '20' }]}>
                    <MaterialIcons
                      name={slide.icon as any}
                      size={64}
                      color={slideColor}
                    />
                  </View>
                )}
                <Text
                  variant="headlineMedium"
                  style={[
                    styles.slideTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {slide.title}
                </Text>
                <Text
                  variant="bodyLarge"
                  style={[
                    styles.slideDescription,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {slide.description}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {showIndicators && slides.length > 1 && (
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    index === currentIndex
                      ? theme.colors.primary
                      : theme.colors.outline + '40',
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  slideTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  slideDescription: {
    textAlign: 'center',
    lineHeight: 24,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

