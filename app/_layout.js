import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#111827',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'My Stuff' }} />
        <Stack.Screen name="add-item" options={{ title: 'Add New Item', presentation: 'modal' }} />
        <Stack.Screen name="item-details" options={{ title: 'Item Overview' }} />
      </Stack>
      </SafeAreaProvider>
    </>
  );
}