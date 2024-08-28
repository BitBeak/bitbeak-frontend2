import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const LevelHexagon = ({ level, status, onPress }) => {
  const getImageSource = () => {
    if (status === 'locked') return require('../../assets/icons/hexagon_locked.png');
    return require('../../assets/icons/hexagon_unlocked.png');
  };

  const handlePress = () => {
    if (status === 'unlocked') {
      onPress(level);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={status === 'locked'}>
      <View style={styles.container}>
        <Image source={getImageSource()} style={styles.hexagonImage} />
        {status !== 'locked' && (
          <Text style={styles.levelText}>{level}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  hexagonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  levelText: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -30 }],
    color: '#0033cc',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LevelHexagon;
