import { StyleSheet, StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Dashboard from './src/screens/Dashboard'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import CreateNote from './src/screens/CreateNote'
import NoteDocumentScreen from './src/screens/NoteDocumentScreen'
import { AppProvider, useAppContext } from './context/AppContext'

const Stack = createStackNavigator()

const AppContent = () => {
  const { isDark } = useAppContext();

  const [loaded, error] = useFonts({
    jakarta_bold: require("./assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    jakarta_regular: require("./assets/fonts/PlusJakartaSans-Regular.ttf"),
    poppins_regular: require("./assets/fonts/Poppins-Regular.ttf"),
    poppins_semibold: require("./assets/fonts/Poppins-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 2000);
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: isDark ? '#121212' : '#ffffff' }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#1a1c22' : '#eff2f4'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#121212' }
          }}
        >
          <Stack.Screen name='Dashboard' component={Dashboard} />
          <Stack.Screen name='CreateNote' component={CreateNote} />
          <Stack.Screen name='NoteDocument' component={NoteDocumentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;