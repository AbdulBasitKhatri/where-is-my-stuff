import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#0F172A', // Dark Navy Accent
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerShadowVisible: false, // Removes harsh border line
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {/* Hide header for index since dashboard has its own top hero bar */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Native modal header */}
        <Stack.Screen
          name="add-item"
          options={{
            title: 'Add New Item',
            presentation: 'modal',
          }}
        />
        
        {/* Native back button + title */}
        <Stack.Screen
          name="item-details"
          options={{
            title: 'Item Details',
            headerBackTitleVisible: false,
          }}
        />
        
        {/* Native back button + title */}
        <Stack.Screen
            name="settings"
            options={{
                title: 'Settings & Preferences',
                headerBackTitleVisible: false,
            }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}