import React from 'react';
import { Image } from 'react-native';
import styles from '../styles/styles';

const Logo = () => (
  <Image
    source={require('../../assets/bitbeak-logo.png')}
    style={styles.logo}
    resizeMode="contain"
  />
);

export default Logo;