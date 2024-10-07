import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MangatecaScreen = ({ route }) => {
  const navigation = useNavigation();
  const { trailNumber } = route.params;
  const [trailData, setTrailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fromMangateca = true;

  useEffect(() => {
    const fetchTrailData = async () => {
      try {
        const url = `http://192.168.0.2:5159/api/Trilhas/ListarDadosTrilha/${trailNumber}`;
        console.log(`Requisição enviada para: ${url}`);
        
        const response = await fetch(url);
        console.log(`Resposta bruta:`, response);

        if (!response.ok) {
          throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Dados recebidos da API:`, data);

        setTrailData(data);
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailData();
  }, [trailNumber]);

  const handleLevelSelection = (levelNumber) => {
    console.log(`Navegando para MangaScreen com trailNumber: ${trailNumber}, levelNumber: ${levelNumber}`);
    navigation.navigate('MangaScreen', { trailNumber, levelNumber, fromMangateca });
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <LinearGradient colors={['#012768', '#006FC2']} style={styles.gradientBackground}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        </LinearGradient>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#012768', '#006FC2']} style={styles.gradientBackground}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>
              {`Mangáteca - Trilha ${trailNumber}`}
            </Text>
          </View>
          <Text style={styles.subHeaderText}>
            Selecione um nível abaixo para visualizar o conteúdo do mangá correspondente.
          </Text>
          <View style={styles.levelsContainer}>
            {trailData && trailData.niveis && trailData.niveis.map((level) => (
              <TouchableOpacity
                key={level.idNivel}
                style={styles.levelCard}
                onPress={() => handleLevelSelection(level.nivel)}
              >
                <View style={styles.iconContainer}>
                  <Icon name="book-open-page-variant" size={40} color="#FFD700" />
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.levelButtonText}>
                    {level.nivelName}
                  </Text>
                </View>
                <Icon name="chevron-right" size={30} color="#ffffff" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    textAlign: 'left',
    flex: 1,
  },
  subHeaderText: {
    color: '#F0F0F0',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  levelsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  levelCard: {
    backgroundColor: '#74A7CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    marginVertical: 5,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 100,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#006FC2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  levelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    lineHeight: 20,
  },
});

export default MangatecaScreen;
