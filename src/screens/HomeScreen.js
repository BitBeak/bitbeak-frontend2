import React, { useState, useEffect, useContext } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, Image, TouchableOpacity, StatusBar, Alert, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';

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
        <StatusBar barStyle="light-content" backgroundColor="#012768" />
        <View style={styles.header}>
          <Image source={require('../../assets/icons/character-icon.png')} style={styles.icon} />
          <View style={styles.expBarContainer}>
            <View style={styles.expBarBackground}>
              <View style={[styles.expBar, { width: `${expProgress * 100}%` }]} />
            </View>
            <View style={styles.levelCircle}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
          </View>
          <View style={styles.expDetails}>
            <Image source={require('../../assets/icons/feather-icon.png')} style={styles.featherIcon} />
            <Text style={styles.expPoints}>{feathers}</Text>
          </View>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleHeader}>TRILHAS</Text>
        </View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
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
        <View style={styles.navBar}>
          <TouchableOpacity>
            <View style={[styles.navIconContainer, styles.activeNavIcon]}>
              
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={styles.navIconContainer}>
              
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={styles.navIconContainer}>
              
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={styles.navIconContainer}>
              
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'transparent',
  },
  icon: {
    width: 90,
    height: 100,
    marginTop: 10,
    marginLeft: 10,
  },
  expBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  expBarBackground: {
    width: 150,
    height: 14,
    backgroundColor: '#ddd',
    borderRadius: 7,
    overflow: 'hidden',
  },
  expBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 7,
  },
  levelCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  expDetails: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 20,
  },
  featherIcon: {
    width: 25,
    height: 25,
    marginBottom: 5,
    marginLeft: 10,
  },
  expPoints: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
  },
  titleHeader: {
    fontFamily: 'Poppins-Bold',
    fontSize: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollView: {
    flexGrow: 0,
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
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    marginTop: 50,
  },
  navIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  activeNavIcon: {
    backgroundColor: '#74a7cc',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  navIcon: {
    width: 35,
    height: 35,
    tintColor: '#FFFFFF',
  },
});

export default HomeScreen;