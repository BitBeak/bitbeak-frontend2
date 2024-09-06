import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import Header from '../components/Header';  // Certifique-se de que o caminho do arquivo está correto
import NavBar from '../components/NavBar';  // Certifique-se de que o caminho do arquivo está correto

// Simulando os dados
const ongoingChallenges = [
  {
    id: '1',
    opponent: 'Dwayne "THE DUCK" Johnson',
    topic: 'Programação I',
    score: '2 x 2',
    yourTurn: false,
  },
  {
    id: '2',
    opponent: 'Duke the Duck',
    topic: 'Lógica de Programação',
    score: '2 x 4',
    yourTurn: true,
  },
];

const ChallengesScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <LinearGradient
      colors={['#012768', '#006FC2']}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        {/* Inclui o Header */}
        <Header />

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleHeader}>DESAFIOS</Text>
        </View>

        {/* Desafios em andamento */}
        <Text style={styles.subtitle}>Em andamento</Text>
        <FlatList
          data={ongoingChallenges}
          keyExtractor={(item) => item.id}
          ListFooterComponent={(
            <TouchableOpacity style={styles.newGameButton}>
              <Text style={styles.newGameText}>DESAFIE UM AMIGO! NOVO JOGO</Text>
            </TouchableOpacity>
          )}
          renderItem={({ item }) => (
            <View style={styles.challengeCard}>
              <Text style={styles.challengeText}>
                Desafiando <Text style={styles.opponent}>{item.opponent}</Text> em {item.topic}
              </Text>
              <Text style={styles.score}>PLACAR: {item.score}</Text>
              {item.yourTurn && <Text style={styles.turn}>SUA VEZ</Text>}
            </View>
          )}
          contentContainerStyle={styles.flatListContent} // Remove espaçamentos extras
        />

        {/* Inclui a Navbar */}
        <NavBar navigation={navigation} currentScreen="ChallengesScreen" />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleHeader: {
    fontFamily: 'Poppins-Bold',
    fontSize: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Bold', // Apenas alteramos a fonte
    fontSize: 20, // Mantém o tamanho original
    color: '#FFF',
    marginVertical: 10,
  },
  challengeCard: {
    backgroundColor: '#407BFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  challengeText: {
    fontSize: 16,
    color: '#FFF',
  },
  opponent: {
    fontWeight: 'bold',
  },
  score: {
    fontSize: 16,
    color: '#FFD700',
  },
  turn: {
    color: '#FFD700',
    marginTop: 5,
  },
  newGameButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  newGameText: {
    fontSize: 16,
    color: '#0A2A53',
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingBottom: 0, // Remove espaçamento adicional no final da lista
  },
});

export default ChallengesScreen;
