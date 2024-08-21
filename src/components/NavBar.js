import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function NavBar({ navigation }) {
  return (
    // TODO: Alterar os ícones conforme o necessário, assim como a navegação para as telas correspondentes
    <View style={styles.navBar}>
      <NavItem icon="home" onPress={() => navigation.navigate('HomeScreen')} />
      <NavItem icon="bullseye" onPress={() => navigation.navigate('MissionScreen')} />
      <NavItem icon="trophy" onPress={() => navigation.navigate('ChallengeScreen')} />
      <NavItem icon="gift" onPress={() => navigation.navigate('RewardsScreen')} />
    </View>
  );
}

function NavItem({ icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.navIconContainer}>
        <FontAwesome5 name={icon} size={30} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    marginBottom: 50,
  },
  navIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
});
