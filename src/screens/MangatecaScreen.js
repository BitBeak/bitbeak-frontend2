import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MangatecaScreen = ({ route }) => {
  const navigation = useNavigation();
  const { trailNumber } = route.params;

  // Lista de títulos de níveis simulados
  const levelTitles = [
    'Nível 1 - Algoritmos de Busca e Ordenação em Grandes Volumes de Dados',
    'Nível 2 - Estruturas de Dados Avançadas',
    'Nível 3 - Fundamentos de Programação Funcional',
    'Nível 4 - Programação Paralela e Concorrente',
    'Nível 5 - Complexidade de Algoritmos e Análise de Desempenho',
  ];

  // Função para navegar para MangaScreen passando o nível selecionado
  const handleLevelSelection = (levelNumber) => {
    navigation.navigate('MangaScreen', { trailNumber, levelNumber});
  };

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#012768', '#006FC2']} style={styles.gradientBackground}>
        <View style={styles.container}>
          {/* Cabeçalho Simples */}
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Mangáteca - Trilha {trailNumber}</Text>
          </View>
          <Text style={styles.subHeaderText}>
            Selecione um nível abaixo para visualizar o conteúdo do mangá correspondente.
          </Text>

          {/* Botões para selecionar os níveis */}
          <View style={styles.levelsContainer}>
            {levelTitles.map((title, index) => (
              <TouchableOpacity
                key={index}
                style={styles.levelCard}
                onPress={() => handleLevelSelection(index + 1)}
              >
                <View style={styles.iconContainer}>
                  <Icon name="book-open-page-variant" size={40} color="#FFD700" />
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.levelButtonText}>
                    {title}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingTop: 60, // Aumentei o espaço no topo do header
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
    fontSize: 16, // Aumentei ligeiramente o tamanho da fonte para destacar melhor o texto
    fontWeight: '500',
    // Removi 'Poppins-Medium' e deixei sem especificar uma fonte para usar a padrão do sistema
    textAlign: 'center',
    marginBottom: 15, // Diminuí a distância para aproximar do primeiro nível
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
    marginVertical: 5, // Reduzido para diminuir o espaço entre os níveis
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 100, // Garantindo espaço suficiente para títulos longos
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
    fontSize: 15, // Fonte ligeiramente aumentada para melhor legibilidade
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    lineHeight: 20,
  },
});

export default MangatecaScreen;
