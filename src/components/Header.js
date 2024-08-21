
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { xp, feathers, level } = useContext(AuthContext);
  const [expProgress, setExpProgress] = useState(calculateExpProgress(xp));

  useEffect(() => {
    setExpProgress(calculateExpProgress(xp));
  }, [xp]);

  return (
    <View style={styles.header}>
      <CharacterIcon />
      <View style={styles.expBarWrapper}>
        <ExpBar progress={expProgress} level={level} />
      </View>
      <ExpDetails feathers={feathers} />
    </View>
  );
};

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
      <Image source={require('../../assets/icons/feather-icon.png')} style={styles.featherIcon} />
      <Text style={styles.expPoints}>{feathers}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  icon: {
    width: 90,
    height: 100,
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
    width: 25,
    height: 25,
    marginBottom: 5,
    marginRight: 30,
  },
  expPoints: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 45,
  },
});

export default Header;
