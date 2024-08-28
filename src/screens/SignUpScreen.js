import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const SignUpScreen = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
        'Mulish-Bold': require('../../assets/fonts/Mulish-Bold.ttf'),
        Mulish: require('../../assets/fonts/Mulish-Regular.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setIsLoading(false);
      setModalVisible(false);
    }, [])
  );

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = () => {
    if (!username.trim()) {
      setError('O nome de usuário é obrigatório.');
      return false;
    }
    if (!email.trim()) {
      setError('O e-mail é obrigatório.');
      return false;
    }
    if (!validateEmail(email)) {
      setError('Insira um e-mail válido.');
      return false;
    }
    if (!password) {
      setError('A senha é obrigatória.');
      return false;
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    return true;
  };

  const handleRegistration = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://192.168.0.2:5159/api/Usuarios/CadastrarUsuario',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: username.trim(),
            email: email.trim(),
            senha: password,
          }),
        }
      );

      const text = await response.text();
      console.log('Registration API Response:', text);

      if (response.ok) {
        setModalVisible(true);
      } else {
        if (response.status === 409) {
          setError('Este e-mail já está cadastrado.');
        } else if (response.status === 400) {
          setError('Erro de validação. Verifique os dados e tente novamente.');
        } else {
          setError('Erro inesperado. Tente novamente mais tarde.');
        }
      }
    } catch (error) {
      console.error('Network or server error:', error);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    navigation.navigate('LoginScreen');
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#012768" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#012768', '#006FC2']}
        style={styles.gradient}
      >
        <Text style={styles.title}>CADASTRO</Text>
        <TextInput
          style={styles.input}
          onChangeText={setUsername}
          value={username}
          placeholder="Nome de Usuário"
          placeholderTextColor="#012768"
          autoCapitalize="words"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="E-mail"
          keyboardType="email-address"
          placeholderTextColor="#012768"
          autoCapitalize="none"
          returnKeyType="next"
        />
        <View style={styles.inputPasswordContainer}>
          <TextInput
            style={styles.inputPassword}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={!passwordVisible}
            placeholder="Senha"
            placeholderTextColor="#012768"
            returnKeyType="next"
          />
          <TouchableWithoutFeedback
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Image
              source={
                passwordVisible
                  ? require('../../assets/icons/showPassword.png')
                  : require('../../assets/icons/hidePassword.png')
              }
              style={styles.toggleIcon}
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.inputPasswordContainer}>
          <TextInput
            style={styles.inputPassword}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            secureTextEntry={!confirmPasswordVisible}
            placeholder="Confirme a senha"
            placeholderTextColor="#012768"
            returnKeyType="done"
          />
          <TouchableWithoutFeedback
            onPress={() =>
              setConfirmPasswordVisible(!confirmPasswordVisible)
            }
          >
            <Image
              source={
                confirmPasswordVisible
                  ? require('../../assets/icons/showPassword.png')
                  : require('../../assets/icons/hidePassword.png')
              }
              style={styles.toggleIcon}
            />
          </TouchableWithoutFeedback>
        </View>
        {error !== '' && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegistration}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#012768" />
          ) : (
            <Text style={styles.registerButtonText}>
              CADASTRAR-SE
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.connectButtonText}>
            Já tem uma conta? Conecte-se
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sucesso!</Text>
            <Text style={styles.modalMessage}>
              Cadastro realizado com sucesso!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalClose}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFD21F',
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    lineHeight: 54,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 27.5,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Mulish',
    color: '#012768',
  },
  inputPasswordContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 27.5,
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  inputPassword: {
    flex: 1,
    fontFamily: 'Mulish',
    fontSize: 16,
    color: '#012768',
  },
  toggleIcon: {
    width: 24,
    height: 24,
    tintColor: '#012768',
  },
  registerButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFD21F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 27.5,
    marginTop: 20,
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#012768',
    fontFamily: 'Mulish-Bold',
    fontSize: 20,
    fontWeight: '700',
  },
  connectButton: {
    width: '100%',
    height: 55,
    backgroundColor: 'rgba(200, 196, 183, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 27.5,
  },
  connectButtonText: {
    color: '#012768',
    fontSize: 18,
    fontFamily: 'Mulish',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 14,
    fontFamily: 'Mulish',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#012768',
    fontFamily: 'Mulish',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    color: '#012768',
    fontFamily: 'Poppins-Bold',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: '#012768',
    fontFamily: 'Mulish',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#FFD21F',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#012768',
    fontSize: 18,
    fontFamily: 'Mulish-Bold',
  },
});

export default SignUpScreen;