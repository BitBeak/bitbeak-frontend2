import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles/styles';

const OutlinedText = ({ text }) => {
  const renderTextShadow = (position) => (
    <Text style={[styles.buttonText, styles.textShadow, position]}>{text}</Text>
  );

  return (
    <View style={styles.textContainer}>
      {renderTextShadow({ top: -1, left: -1 })}
      {renderTextShadow({ top: -1, left: 1 })}
      {renderTextShadow({ top: 1, left: -1 })}
      {renderTextShadow({ top: 1, left: 1 })}
      <Text style={styles.buttonText}>{text}</Text>
    </View>
  );
};

export default OutlinedText;