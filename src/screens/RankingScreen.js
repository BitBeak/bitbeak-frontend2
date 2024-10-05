import React, { useEffect, useState, useContext } from 'react';
import { Text, FlatList, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import RankingItem from '../components/RankingItem';
import NavBar from '../components/NavBar.js';
import { AuthContext } from '../context/AuthContext';

export default function RankingScreen({ navigation }) {
  const { userId } = useContext(AuthContext);
  const [topUsuarios, setTopUsuarios] = useState([]);
  const [posicaoAtual, setPosicaoAtual] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch(`http://192.168.0.16:5159/api/Jogo/RankingQuinzenal/${userId}`);
        const data = await response.json();

        setTopUsuarios(data.topUsuarios || []);
        setPosicaoAtual(data.posicaoAtual || null);
      } catch (error) {
        console.error('Erro ao buscar os dados do ranking:', error.message);
      }
    };

    fetchRanking();
  }, [userId]);

  const getRankingData = () => {
    if (!posicaoAtual) return topUsuarios.slice(0, 5);

    const filteredTopUsuarios = topUsuarios.filter(user => user && user.idUsuario);
    const top5 = filteredTopUsuarios.slice(0, 5);

    return [...top5, posicaoAtual];
  };

  return (
    <LinearGradient colors={['#012768', '#006FC2']} style={styles.container}>
      <Header />
      <Text style={styles.header}>RANKING</Text>
      <Text style={styles.subHeader}>Atualizado quinzenalmente! Quanto melhor colocado, mais penas você ganha!</Text>
      <FlatList
        data={getRankingData()}
        renderItem={({ item, index }) => {
          const rankingData = getRankingData();
          const isLastItem = index === rankingData.length - 1;

          return (
            <View style={isLastItem ? styles.posicaoAtualContainer : styles.rankingItemContainer}>
              {isLastItem && (
                <Text style={styles.posicaoAtualLabel}>SUA POSIÇÃO ATUAL:</Text>
              )}
              <RankingItem
                item={{
                  id: item.idUsuario,
                  name: item.nome,
                  score: item.experienciaQuinzenal,
                  rank: item.posicao,
                  avatar: require('../../assets/bitbeak-logo.png')
                }}
              />
            </View>
          );
        }}
        keyExtractor={item => `${item.idUsuario}-${item.posicao}`}
        contentContainerStyle={styles.listContainer}
      />
      <NavBar navigation={navigation} currentScreen="RankingScreen" />
      <View style={styles.spacer} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B80',
    paddingTop: 12,
  },
  listContainer: {
    alignItems: 'center',
  },
  header: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeader: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  rankingItemContainer: {
    alignItems: 'center',
    width: '100%',
  },
  posicaoAtualContainer: {
    alignItems: 'center',
    width: '100%',
    borderColor: '#FFD700',
    borderWidth: 2,
    borderRadius: 10,
    padding: 5,
    marginVertical: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  posicaoAtualLabel: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  spacer: {
    height: 55,
  },
});
