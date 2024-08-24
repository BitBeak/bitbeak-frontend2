import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import RankingItem from '../components/RankingItem';
import NavBar from '../components/NavBar.js';

export default function RankingScreen({ navigation }) {
  const [topUsuarios, setTopUsuarios] = useState([]);
  const [posicaoAtual, setPosicaoAtual] = useState(null);

  useEffect(() => {
    console.log("useEffect executado");

    const fetchRanking = async () => {
      try {
        console.log("Tentando buscar os dados...");

        const response = await axios.get('http://192.168.0.2:5159/api/Jogo/RankingQuinzenal/1');
        console.log(response.data);

        setTopUsuarios(response.data.topUsuarios);
        setPosicaoAtual(response.data.posicaoAtual);

      } catch (error) {
        console.error('Erro ao buscar os dados do ranking:', error.response ? error.response.data : error.message);
      }
    };

    fetchRanking();
  }, []);

  return (
    <LinearGradient colors={['#012768', '#006FC2']} style={styles.container}>
      <Header />
      <Text style={styles.header}>RANKING</Text>
      <Text style={styles.subHeader}>Atualizado quinzenalmente! Quanto melhor colocado, mais penas você ganha!</Text>
      <FlatList
        data={topUsuarios.length > 0 ? topUsuarios : []}
        renderItem={({ item }) => (
          <RankingItem item={{
            id: item.idUsuario,
            name: item.nome,
            score: item.experienciaQuinzenal,
            rank: item.posicao,
            avatar: require('../../assets/bitbeak-logo.png')
          }} />
        )}
        keyExtractor={item => item.idUsuario.toString()}
        contentContainerStyle={styles.listContainer}
      />
      {posicaoAtual && (
        <Text style={styles.posicaoAtual}>
          Sua posição atual: {posicaoAtual.nome} - Posição: {posicaoAtual.posicao}
        </Text>
      )}
      <NavBar navigation={navigation} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B80',
    paddingTop: 40,
  },
  listContainer: {
    alignItems: 'center',
  },
  header: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  subHeader: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  posicaoAtual: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
});
