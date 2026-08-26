import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#121214' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#121214' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'VaultTrack' }} />
        <Stack.Screen name="add-item" options={{ title: 'Add New Item', presentation: 'modal' }} />
        <Stack.Screen name="item-details" options={{ title: 'Item Overview' }} />
      </Stack>
    </>
  );
}