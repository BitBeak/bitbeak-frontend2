import React from 'react';
import { View, StyleSheet } from 'react-native';

const Line = () => {
  return <View style={styles.line} />;
};

const styles = StyleSheet.create({
  line: {
    width: 1,
    height: 120,
    backgroundColor: '#FFFFFF',
    marginTop: -55,
    marginBottom: -26
  },
});

export default Line;
