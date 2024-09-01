import React, { useState, useContext, useEffect, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Navbar from '../components/NavBar.js';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { userId, setUserData, trails, updateTrailProgress } = useContext(AuthContext);
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (fontsLoaded) {
        fetchUserData();
      }
      return () => {
        setLoading(true);
      };
    }, [fontsLoaded])
  );

  const fetchUserData = async () => {
    try {
      const progressResponse = await fetch(`http://192.168.0.2:5159/api/Usuarios/ObterProgressoUsuario/${userId}`);
      const progressData = await progressResponse.json();

      setUserData({
        newLevel: progressData.nivelAtual,
        newXp: (progressData.experienciaUsuario / progressData.experienciaNecessaria) * 100,
        newFeathers: progressData.penas,
      });

      await Promise.all(
        trails.map(async (trail) => {
          try {
            const response = await fetch(`http://192.168.0.2:5159/api/Usuarios/ObterNiveisConcluidos/${trail.id}/${userId}`);
            const contentType = response.headers.get("content-type");

            if (response.status === 400 || (contentType && contentType.indexOf("text/plain") !== -1)) {
              const textData = await response.text();
              if (textData.includes("Nenhum nível concluído encontrado")) {
                updateTrailProgress(trail.id, 0);
              } else {
                console.warn(`Unexpected response text for trail ID ${trail.id}: ${textData}`);
                updateTrailProgress(trail.id, 0);
              }
            } else if (contentType && contentType.indexOf("application/json") !== -1) {
              const trailData = await response.json();
              updateTrailProgress(trail.id, trailData.quantidadeConcluida || 0);
            } else {
              const textData = await response.text();
              console.warn(`Unexpected content type or response for trail ID ${trail.id}: ${textData}`);
              updateTrailProgress(trail.id, 0);
            }
          } catch (error) {
            console.error(`Failed to fetch trail data for trail ID ${trail.id}:`, error);
          }
        })
      );

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      Alert.alert("Erro", "Falha ao carregar os dados do servidor.");
    }
  };

  const handleEnterTrail = (trail) => {
    if (trail && trail.unlocked) {
      navigation.navigate('MapScreen', { trailNumber: trail.id });
    } else {
      Alert.alert("Trilha Bloqueada", "Esta trilha está bloqueada. Complete a trilha anterior para desbloquear.");
    }
  };

  const handleStudyGuide = (trail) => {
    if (trail && trail.unlocked) {
      Alert.alert("Guia de Estudo", `Você clicou em 'Guia de Estudo ${trail.title}'!`);
    } else {
      Alert.alert("Trilha Bloqueada", "Esta trilha está bloqueada. Complete a trilha anterior para desbloquear.");
    }
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / slideSize);
    setCurrentIndex(index);
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006FC2" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#012768', '#006FC2']} style={styles.container}>
        <Header navigation={navigation} style={styles.header} />
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
          contentContainerStyle={styles.scrollViewContent}
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
        <Navbar navigation={navigation} currentScreen="HomeScreen" style={styles.navbar} />
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#006FC2',
  },
  container: {
    flex: 1,
    padding: 10,
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
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
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
    marginTop: 25,
    marginLeft: 1.5,
    width: width * 0.94,
    height: 320,
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
    marginBottom: 45
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
