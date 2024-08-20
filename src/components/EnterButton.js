import React from 'react';
import { TouchableOpacity } from 'react-native';
import OutlinedText from './OutlinedText.js';
import styles from '../styles/styles';

const EnterButton = ({ onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <OutlinedText text="ENTRAR" />
  </TouchableOpacity>
);

export default EnterButton;