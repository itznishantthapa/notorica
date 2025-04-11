import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference)
const baseWidth = 450; // Standard iPhone width reference
const baseHeight = 900; // Standard iPhone height reference

/**
 * Scales width based on screen size
 * @param size - Size in pixels based on design reference
 */
export const wp = (size: number): number => {
    return (SCREEN_WIDTH / baseWidth) * size;
};

/**
 * Scales height based on screen size
 * @param size - Size in pixels based on design reference
 */
export const hp = (size: number): number => {
    return (SCREEN_HEIGHT / baseHeight) * size;
};

/**
 * Scales fonts based on screen size
 * @param size - Font size in pixels based on design reference
 */
export const fontSize = (size: number): number => {
    return Math.round(wp(size));
};

/**
 * Returns dimensions object with responsive values
 */
export const responsiveDimensions = {
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
    isSmallDevice: SCREEN_WIDTH < 375,
    wp,
    hp,
    fontSize,
}; 