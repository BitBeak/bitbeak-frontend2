import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import NavBar from './NavBar';

export default function RankingItem({ item }) {
  return (
    <View style={styles.itemWrapper}>
      <View style={[styles.rankContainer, { backgroundColor: getRankColor(item.rank) }]}>
        <View style={styles.rankTextContainer}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>
        <Image source={item.avatar} style={styles.avatar} />
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.scoreText}>{item.score}</Text>
      </View>
      <View style={styles.rankTail} />
    </View>
  );
}

function getRankColor(rank) {
  switch (rank) {
    case 1:
      return '#FFD700';
    case 2:
      return '#C0C0C0';
    case 3:
      return '#CD7F32';
    default:
      return '#FFFFFF';
  }
}

const styles = StyleSheet.create({
  itemWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    width: '90%',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rankTail: {
    backgroundColor: '#FFF',
    width: '85%',
    height: 7,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  rankTextContainer: {
    backgroundColor: '#FFFFFF',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    color: '#012768',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 15,
  },
  nameText: {
    flex: 1,
    color: '#012768',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  scoreText: {
    color: '#012768',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});
