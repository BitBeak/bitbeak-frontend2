import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 350, height: 350},
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 65,
    paddingVertical: 7,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  textContainer: { position: 'relative' },
  textShadow: {
    position: 'absolute',
    color: '#011B40',
    opacity: 0.5,
  },
});

export default styles;