import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient'; 
import { useFonts } from 'expo-font'; 
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/NavBar.js';

const MissionScreen = ({ navigation }) => {
  const { xp, feathers, level, correctAnswers, trails, userId } = useContext(AuthContext); 
  const [expProgress, setExpProgress] = useState(calculateExpProgress(xp));
  const [missions, setMissions] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    setExpProgress(calculateExpProgress(xp));
  }, [xp]);

  const fetchMissions = async () => {
    try {
      const response = await fetch(`http://192.168.0.16:5159/api/Missoes/ObterMissoesAtivasUsuario/${userId}`);
      const data = await response.json();
      setMissions(data); 
      setLoading(false); 
    } catch (error) {
      console.error('Erro ao buscar as missões:', error);
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const getMissionProgress = (mission) => {
    return mission.progressoAtual || 0;
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#012768', '#006FC2']} style={styles.gradient}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <CharacterIcon />
          <View style={styles.expBarWrapper}>
            <ExpBar progress={expProgress} level={level} />
          </View>
          <ExpDetails feathers={feathers} />
        </View>

        {/* Título Principal e Badge */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            MISSÕES<Text style={styles.badge}> ({missions.length})</Text>
          </Text>
        </View>

        {/* Missões */}
        <View style={styles.missionsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFD700" /> 
          ) : (
            <FlatList
              data={missions} 
              keyExtractor={(item) => item.descricao} 
              renderItem={({ item, index }) => {
                const progress = getMissionProgress(item);
                return (
                  <View style={styles.missionCard}>
                    <View style={styles.missionHeader}>
                      {/* Dividindo o título em duas partes para estilos diferentes */}
                      <Text style={styles.missionTitle}>
                        <Text style={styles.missionPrefix}>{`Missão ${index + 1}: `}</Text>
                        {item.descricao}
                      </Text> 
                    </View>
                    <View style={styles.progressWrapper}>
                      <ProgressBar 
                        progress={progress / item.objetivo} 
                        color="#FFD700" 
                        unfilledColor="#FFFFFF" 
                        style={styles.progressBar}
                      />
                      <Text style={styles.progressText}>{`${progress} / ${item.objetivo}`}</Text> 
                    </View>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* NavBar */}
        <Navbar navigation={navigation} currentScreen="MissionScreen" style={styles.navbar} />
        <View style={styles.spacer} />
      </View>
    </LinearGradient>
  );
};

// Funções auxiliares e componentes

function calculateExpProgress(xp) {
  return xp / 100;
}

function CharacterIcon() {
  return (
    <Image source={require('../../assets/icons/character-icon.png')} style={styles.icon} />
  );
}

function ExpBar({ progress, level }) {
  return (
    <View style={styles.expBarContainer}>
      <View style={styles.expBarBackground}>
        <View style={[styles.expBar, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.levelCircle}>
        <Text style={styles.levelText}>{level}</Text>
      </View>
    </View>
  );
}

function ExpDetails({ feathers }) {
  return (
    <View style={styles.expDetails}>
      <Icon name="feather" size={25} color="#FFFFFF" style={styles.featherIcon} />
      <Text style={styles.expPoints}>{feathers}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  icon: {
    width: 90,
    height: 100,
    marginRight: 5,
  },
  expBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  expBarContainer: {
    marginLeft: -30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expBarBackground: {
    width: 100,
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
    marginLeft: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  expDetails: {
    alignItems: 'center',
  },
  featherIcon: {
    marginBottom: 5,
    marginRight: 40,
  },
  expPoints: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 45,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: -5,
  },
  mainTitle: {
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  badge: {
    fontSize: 22,
    color: '#FFD700',
    fontFamily: 'Poppins-Bold',
    position: 'relative',
    top: 5, 
  },
  missionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  missionCard: {
    backgroundColor: '#74A7CC', 
    padding: 15,
    borderRadius: 15, // Mais arredondado
    marginBottom: 10,
  },
  missionHeader: {
    marginBottom: 5, 
  },
  missionTitle: {
    fontSize: 18,
    color: '#012768', // Cor padrão para a descrição da missão
    fontFamily: 'Poppins-Bold',
  },
  missionPrefix: {
    color: '#FFD700', // Cor laranja para o prefixo "Missão X:"
  },
  progressWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  progressBar: {
    height: 27, 
    borderRadius: 10,
    backgroundColor: '#FFFFFF', 
  },
  progressText: {
    position: 'absolute', 
    textAlign: 'center',
    width: '100%', 
    color: '#012768',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  spacer: {
    height: 55,
  },
});

export default MissionScreen;
