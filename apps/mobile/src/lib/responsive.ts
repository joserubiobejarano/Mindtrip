import { useWindowDimensions } from 'react-native';
import { StyleSheet } from 'react-native';

/**
 * Determines if a given width should be considered a tablet
 * @param width - Screen width in pixels
 * @returns true if width >= 768 (tablet threshold)
 */
export function isTablet(width: number): boolean {
  return width >= 768;
}

/**
 * Hook that provides responsive dimensions and tablet detection
 * @returns Object with width, height, and tablet boolean
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    tablet: isTablet(width),
  };
}

/**
 * Container style for responsive layouts
 * Centers content on large screens with a max width constraint
 */
export const containerStyle = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 640,
  },
});

