import React from 'react';
import { Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import RankingItem from '../components/RankingItem';
import NavBar from '../components/NavBar.js';

const data = [
  { id: '1', name: 'Dwayne "THE DUCK" Johnson', score: 1120, rank: 1, avatar: require('../../assets/bitbeak-logo.png') },
  { id: '2', name: 'Duke the Duck', score: 1082, rank: 2, avatar: require('../../assets/bitbeak-logo.png') },
  { id: '3', name: 'Duck Norris', score: 1066, rank: 3, avatar: require('../../assets/bitbeak-logo.png') },
  { id: '4', name: 'Duck Vader', score: 1001, rank: 4, avatar: require('../../assets/bitbeak-logo.png') },
  { id: '5', name: 'Ana Quackstela', score: 830, rank: 5, avatar: require('../../assets/bitbeak-logo.png') },
  { id: '18', name: 'Você', score: 238, rank: 18, avatar: require('../../assets/bitbeak-logo.png') },
];

export default function RankingScreen({ navigation }) {
  return (
    <LinearGradient colors={['#012768', '#006FC2']} style={styles.container}>
      <Header />
      <Text style={styles.header}>RANKING</Text>
      <Text style={styles.subHeader}>Atualizado quinzenalmente! Quanto melhor colocado, mais penas você ganha!</Text>
      <FlatList
        data={data.slice(0, 7)} 
        renderItem={({ item }) => <RankingItem item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
});
