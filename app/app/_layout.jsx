import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {


  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="login-password" />
        <Stack.Screen name="check-email" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="add-user" />
        <Stack.Screen name="register-with-code" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="onboarding-1" />
        <Stack.Screen name="onboarding-2" />
        <Stack.Screen name="onboarding-3" />
        <Stack.Screen name="onboarding-4" />
        <Stack.Screen name="onboarding-5" />
        <Stack.Screen name="check-health" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>

  );
}
