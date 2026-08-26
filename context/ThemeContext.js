import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@app_theme_mode';
const DEFAULT_CURRENCY_KEY = '@app_default_currency';

export const LIGHT_COLORS = {
  background: '#FFFFFF',
  card: '#F8FAFC',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#0F172A',
  primaryText: '#FFFFFF',
  danger: '#EF4444',
  modalOverlay: 'rgba(15, 23, 42, 0.4)',
};

export const DARK_COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#334155',
  primary: '#38BDF8',
  primaryText: '#0F172A',
  danger: '#F87171',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  
  // 1. Default initial state to 'system' instead of 'light'
  const [themeMode, setThemeMode] = useState('system'); 
  const [defaultCurrency, setDefaultCurrency] = useState({ code: 'USD', symbol: '$' });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme) {
          setThemeMode(savedTheme);
        }

        const savedCurrency = await AsyncStorage.getItem(DEFAULT_CURRENCY_KEY);
        if (savedCurrency) {
          setDefaultCurrency(JSON.parse(savedCurrency));
        }
      } catch (e) {
        console.error('Failed to load settings context', e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // 2. Compute active mode dynamically whenever themeMode or systemColorScheme updates
  const activeMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme || 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const colors = activeMode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const isDark = activeMode === 'dark';
  const theme = colors;

  const updateThemeMode = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  };

  const updateDefaultCurrency = async (currencyObj) => {
    setDefaultCurrency(currencyObj);
    await AsyncStorage.setItem(DEFAULT_CURRENCY_KEY, JSON.stringify(currencyObj));
  };

  // Prevent UI flash before stored preferences finish loading
  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        activeMode,
        colors,
        theme,
        isDark,
        defaultCurrency,
        updateThemeMode,
        updateDefaultCurrency,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};