import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import InitialScreen from './src/screens/InitialScreen';
import LoginScreen from './src/screens/LoginScreen'
import SignUpScreen from './src/screens/SignUpScreen';
import PasswordResetScreen from './src/screens/PasswordResetScreen'
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import MangaScreen from './src/screens/MangaScreen';
import QuestionScreen from './src/screens/QuestionScreen';
import QuizzQuestionScreen from './src/screens/QuizzQuestionScreen';
import MatchColumnsScreen from './src/screens/MatchColumnsScreen';
import CodeQuestionScreen from './src/screens/CodeQuestionScreen';
import CodeFillScreen from './src/screens/CodeFillScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';
import FriendsListScreen from './src/screens/FriendsListScreen';
import SpecialQuestionScreen from './src/screens/SpecialQuestionScreen';
import MissionScreen from './src/screens/MissionScreen';
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
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="PasswordResetScreen" component={PasswordResetScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="MapScreen" component={MapScreen} />
          <Stack.Screen name="MangaScreen" component={MangaScreen} />
          <Stack.Screen name="QuestionScreen" component={QuestionScreen} />
          <Stack.Screen name="QuizzQuestionScreen" component={QuizzQuestionScreen} />
          <Stack.Screen name="MatchColumnsScreen" component={MatchColumnsScreen} />
          <Stack.Screen name="CodeQuestionScreen" component={CodeQuestionScreen} />
          <Stack.Screen name="CodeFillScreen" component={CodeFillScreen} />
          <Stack.Screen name="ChallengesScreen" component={ChallengesScreen} />
          <Stack.Screen name="FriendsListScreen" component={FriendsListScreen} />
          <Stack.Screen name="SpecialQuestionScreen" component={SpecialQuestionScreen} />
          <Stack.Screen name="MissionScreen" component={MissionScreen} />
          <Stack.Screen name="RankingScreen" component={RankingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}