import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import InitialScreen from './src/screens/InitialScreen';
import LoginScreen from './src/screens/LoginScreen'
import RankingScreen from './src/screens/RankingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="InitialScreen"
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            transitionSpec: {
              open: {
                animation: 'timing',
                config: {
                  duration: 500,
                },
              },
              close: {
                animation: 'timing',
                config: {
                  duration: 500,
                },
              },
            },
          }}
        >
          <Stack.Screen name="InitialScreen" component={InitialScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RankingScreen" component={RankingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}