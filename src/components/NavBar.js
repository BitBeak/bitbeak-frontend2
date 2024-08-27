import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function NavBar({ navigation, currentScreen }) {
  return (
    <View style={styles.navBar}>
      <NavItem 
        icon="home" 
        onPress={() => navigation.navigate('HomeScreen')} 
        isActive={currentScreen === 'HomeScreen'}
      />
      <NavItem 
        icon="bullseye" 
        onPress={() => navigation.navigate('MissionScreen')} 
        isActive={currentScreen === 'MissionScreen'}
      />
      <NavItem 
        iconComponent={MaterialCommunityIcons} 
        icon="sword-cross" 
        onPress={() => navigation.navigate('RewardsScreen')} 
        isActive={currentScreen === 'RewardsScreen'}
      />
      <NavItem 
        icon="trophy" 
        onPress={() => navigation.navigate('RankingScreen')} 
        isActive={currentScreen === 'RankingScreen'}
      />
    </View>
  );
}

function NavItem({ icon, iconComponent: IconComponent = FontAwesome5, onPress, isActive }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.navIconContainer, isActive && styles.activeNavIcon]}>
        <IconComponent name={icon} size={30} color={"#FFFFFF"} /> 
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
  activeNavIcon: {
    backgroundColor: '#74a7cc',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
});
