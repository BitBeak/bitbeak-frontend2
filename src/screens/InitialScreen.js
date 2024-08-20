import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font'; // Pode dar algum problema aqui
import Logo from '../components/Logo';
import EnterButton from '../components/EnterButton.js';
import styles from '../styles/styles';

export default function InitialScreen({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
      });
      setFontsLoaded(true);
    })();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  const handlePress = () => {
    navigation.navigate('LoginScreen');
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <LinearGradient colors={['#012768', '#006FC2']} style={styles.background}>
        <Logo />
        <EnterButton onPress={handlePress} />
      </LinearGradient>
    </SafeAreaProvider>
  );
};