import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import Header from '../components/Header';
import NavBar from '../components/NavBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  // Função que navega para a tela de amigos
  const handleNewGamePress = () => {
    navigation.navigate('FriendsListScreen'); // Substitua 'FriendsListScreen' pelo nome da sua tela de amigos
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <LinearGradient
      colors={['#012768', '#006FC2']}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <Header />

        <View style={styles.titleContainer}>
          <Text style={styles.titleHeader}>DESAFIOS</Text>
        </View>

        <Text style={styles.subtitle}>Em andamento</Text>
        <FlatList
          data={ongoingChallenges}
          keyExtractor={(item) => item.id}
          ListFooterComponent={(
            <View style={styles.newGameContainer}>
              <View style={styles.iconContainer}>
                <Icon name="help-circle-outline" size={50} color="#FFD700" />
              </View>
              <View style={styles.textAndButtonContainer}>
                <Text style={styles.newGameLabel}>DESAFIE UM AMIGO!</Text>
                <TouchableOpacity
                  style={styles.newGameButton}
                  onPress={handleNewGamePress} // Adicionando a navegação aqui
                >
                  <Text style={styles.newGameButtonText}>NOVO JOGO</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.challengeCard}>
              <View style={styles.iconContainer}>
                <Icon name="account-circle" size={40} color="#FFF" />
              </View>
              {item.yourTurn && (
                <View style={styles.sticker}>
                  <Text style={styles.turnText}>SUA VEZ</Text>
                </View>
              )}
              <View style={styles.infoContainer}>
                <Text style={styles.challengeText}>
                  Desafiando <Text style={styles.opponent}>{item.opponent}</Text> em {item.topic}
                </Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.score}>PLACAR: {item.score}</Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
        />

        <NavBar navigation={navigation} currentScreen="ChallengesScreen" />
        <View style={styles.spacer} />
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
    padding: 15,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  titleHeader: {
    fontFamily: 'Poppins-Bold',
    fontSize: 34,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginVertical: 4,
  },
  challengeCard: {
    backgroundColor: '#74A7CC',
    padding: 15,
    borderRadius: 15,
    marginVertical: 7, // Diminuindo a margem vertical para reduzir a distância entre os cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#006FC2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sticker: {
    position: 'absolute',
    top: -10,
    right: 5,
    backgroundColor: '#FF6C00',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    zIndex: 1,
  },
  turnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  challengeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#012768',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  opponent: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  scoreContainer: {
    backgroundColor: '#012768',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
  },
  newGameContainer: {
    backgroundColor: '#74A7CC',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginVertical: 6, // Diminuindo a margem vertical para reduzir a distância abaixo deste card
  },
  textAndButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 30, // Mantendo o texto no local desejado
  },
  newGameLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#0A2A53',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  newGameButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 6, // Reduzi a altura do botão para torná-lo mais compacto
    width: 150, // Aumentando a largura do botão
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginTop: 3,
    marginLeft: -10, // Movendo apenas o botão um pouco mais para a esquerda
  },
  newGameButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#0A2A53',
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingBottom: 10,
  },
  spacer: {
    height: 55,
  },
});

export default ChallengesScreen;
