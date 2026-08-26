import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function LayoutContent() {
    const { colors } = useTheme();
    return (
        <SafeAreaProvider>
            <StatusBar style={colors.background === '#FFFFFF' ? 'dark' : 'light'} />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontWeight: '700', fontSize: 18 },
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="add-item" options={{ title: 'Add New Item', presentation: 'modal' }} />
                <Stack.Screen name="item-details" options={{ title: 'Item Details', headerBackTitleVisible: false }} />
                <Stack.Screen name="settings" options={{ title: 'Settings & Preferences', headerBackTitleVisible: false }} />
            </Stack>
        </SafeAreaProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <LayoutContent />
        </ThemeProvider>
    );
}