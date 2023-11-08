import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: '#000000',
    primary: '#560CCE',
    secondary: '#414757',
    error: '#f13a59',
  },
}


export const mainTheme = {
  ...DefaultTheme,
  roundness: 4,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#e74c3c',
    background: '#f5f5f5',
    surface: '#ffffff', 
  },
  fonts: {
    regular: { fontFamily: 'Roboto', fontWeight: 'normal' },
    medium: { fontFamily: 'Roboto', fontWeight: 'medium' },
    light: { fontFamily: 'Roboto', fontWeight: 'light' },
    thin: { fontFamily: 'Roboto', fontWeight: 'thin' },
  },
  spacing: {
    unit: 8,
  },
};
