import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { initDatabase } from '../db/database'; // Import the file we just made

export default function RootLayout() {
  
  useEffect(() => {
    // This runs ONCE when the app starts
    console.log("📲 App starting... initializing DB");
    initDatabase();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      {/* 'Slot' tells Expo to render the current screen (like index or login) */}
      <Slot />
    </View>
  );
}