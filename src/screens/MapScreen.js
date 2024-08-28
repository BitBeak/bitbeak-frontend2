import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import LevelHexagon from '../components/LevelHexagon';
import Line from '../components/Line';
import * as Font from 'expo-font';

const loadFonts = () => {
  return Font.loadAsync({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
    'Mulish-Bold': require('../../assets/fonts/Mulish-Bold.ttf'),
    'Mulish': require('../../assets/fonts/Mulish-Regular.ttf'),
  });
};

const MapScreen = ({ route }) => {
  const { trailNumber } = route.params;
  const { trails } = useContext(AuthContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  const handlePressLevel = (level) => {
    navigation.navigate('ExplanationScreen', { level, trailNumber });
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const levelsData = [
    { level: 1, status: 'unlocked', isSpecial: false },
    { level: 2, status: trails[trailNumber - 1].levelsCompleted >= 1 ? 'unlocked' : 'locked', isSpecial: false },
    { level: 3, status: trails[trailNumber - 1].levelsCompleted >= 2 ? 'unlocked' : 'locked', isSpecial: false },
    { level: 4, status: trails[trailNumber - 1].levelsCompleted >= 3 ? 'unlocked' : 'locked', isSpecial: false },
    { level: 5, status: trails[trailNumber - 1].levelsCompleted >= 4 ? 'unlocked' : 'locked', isSpecial: false },
  ].reverse();

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#012768', '#006FC2']} style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} color="#ffffff" />
        </TouchableOpacity>
        <Icon name="more-vert" size={30} color="#ffffff" style={styles.dotsIcon} />
        <Text style={styles.title}>{`TRILHA ${trailNumber}`}</Text>
        <Text style={styles.subtitle}>{trails[trailNumber - 1].title}</Text>
        <Text style={styles.levelsCompletedText}>{trails[trailNumber - 1].levelsCompleted} / {trails[trailNumber - 1].totalLevels} Níveis</Text>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        >
          {levelsData.map((level, index) => (
            <View key={index} style={styles.hexagonContainer}>
              <LevelHexagon level={level.level} status={level.status} onPress={() => handlePressLevel(level.level)} />
              {index < levelsData.length - 1 && <Line />}
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  dotsIcon: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  title: {
    color: 'white',
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    marginTop: 62,
    textAlign: 'center',
  },
  subtitle: {
    color: 'white',
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  levelsCompletedText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginTop: 10,
  },
  scrollView: {
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'flex-end',
  },
  hexagonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapScreen;
