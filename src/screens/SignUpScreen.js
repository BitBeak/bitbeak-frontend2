import React, { useState, useEffect, useContext } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, ScrollView, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import NavBar from '../components/NavBar';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { xp, feathers, level, trails } = useContext(AuthContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [expProgress, setExpProgress] = useState(xp / 100);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
      });
      setFontsLoaded(true);
    })();
  }, []);

  useEffect(() => {
    setExpProgress(xp / 100);
  }, [xp]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  const handleEnterTrail = (trail) => {
    if (trail.unlocked) {
      navigation.navigate('MapScreen', { trailNumber: trail.id });
    } else {
      Alert.alert("Trilha Bloqueada", "Esta trilha está bloqueada. Complete a trilha anterior para desbloquear.");
    }
  };

  const handleStudyGuide = (trail) => {
    if (trail.unlocked) {
      Alert.alert("Guia de Estudo", `Você clicou em 'Guia de Estudo ${trail.title}'!`);
    } else {
      Alert.alert("Trilha Bloqueada", "Esta trilha está bloqueada. Complete a trilha anterior para desbloquear.");
    }
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#012768', '#006FC2']} style={styles.container}>
        <Header navigation={navigation} />
        <Text style={styles.header}>TRILHAS</Text>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollView}
        >
          {trails.map((trail) => (
            <View key={trail.id} style={styles.trailContainer}>
              <Text style={styles.trailTitle}>{trail.title}</Text>
              <Text style={styles.trailLevel}>{trail.levelsCompleted} / {trail.totalLevels} NÍVEIS</Text>
              <TouchableOpacity
                style={[styles.trailButton, styles.enterTrailButton]}
                onPress={() => handleEnterTrail(trail)}
                disabled={!trail.unlocked}
              >
                <Text style={styles.trailButtonText}>ENTRAR NA TRILHA</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.trailButton, styles.studyGuideButton]}
                onPress={() => handleStudyGuide(trail)}
                disabled={!trail.unlocked}
              >
                <Text style={styles.trailButtonText}>GUIA DE ESTUDO</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <View style={styles.pageIndicator}>
          {trails.map((_, index) => (
            <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
          ))}
        </View>
        <NavBar navigation={navigation} />
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B80',
    paddingTop: 40,
  },
  header: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  scrollView: {
    alignItems: 'center',
  },
  trailContainer: {
    backgroundColor: '#74a7cc',
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
    marginTop: 45,
    marginLeft: 15,
    marginRight: 15,
    width: width * 0.88,
  },
  trailTitle: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 15,
  },
  trailLevel: {
    color: '#DDDDDC',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 36,
    width: 90,
    height: 36,
    textAlign: 'center',
  },
  trailButton: {
    backgroundColor: '#328BCD',
    borderRadius: 40,
    width: 269,
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor: '#74a7cc',
    borderWidth: 2,
  },
  enterTrailButton: {
    marginBottom: 10,
  },
  studyGuideButton: {
    marginBottom: 20,
  },
  trailButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.17,
    textAlign: 'center',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#FFD700',
  },
});

export default HomeScreen;
