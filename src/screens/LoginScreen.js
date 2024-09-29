import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, StyleSheet, TextInput, View, Text, TouchableOpacity, Image, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
        'Mulish-Bold': require('../../assets/fonts/Mulish-Bold.ttf'),
        'Mulish': require('../../assets/fonts/Mulish-Regular.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setError('');
      setIsLoading(false);
    }, [])
  );

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = () => {
    if (!email) {
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
    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://192.168.0.16:5159/api/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: password,
        }),
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse response as JSON:', jsonError);
          setError('Erro ao processar a resposta do servidor. Tente novamente.');
          setIsLoading(false);
          return;
        }
      } else {
        const text = await response.text();

        if (text === 'Usuário não encontrado.' || text === 'Senha incorreta.') {
          setError('E-mail e/ou senha incorreta.');
        } else {
          setError('Ocorreu um erro inesperado. Por favor, tente novamente.');
        }
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        setUser(data);
        navigation.navigate('HomeScreen');
      } else {
        console.warn('Login failed:', data);
        setError('E-mail e/ou senha incorreta.');
      }
    } catch (error) {
      console.error('Network or server error:', error);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUpScreen = () => {
    navigation.navigate('SignUpScreen');
  };

  const navigateToPasswordResetScreen = () => {
    navigation.navigate('PasswordResetScreen');
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando fontes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#012768', '#006FC2']} style={styles.gradient}>
        <Image source={require('../../assets/bitbeak-logo.png')} style={styles.logo} />
        <Text style={styles.title}>LOGIN</Text>
        <TextInput
          style={styles.inputEmail}
          onChangeText={setEmail}
          value={email}
          placeholder="E-mail"
          keyboardType="email-address"
          placeholderTextColor="#012768"
        />
        <View style={styles.inputPasswordContainer}>
          <TextInput
            style={styles.inputPassword}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={!passwordVisible}
            placeholder="Senha"
            placeholderTextColor="#012768"
          />
          <TouchableWithoutFeedback onPress={() => setPasswordVisible(!passwordVisible)}>
            <Image
              source={passwordVisible ? require('../../assets/icons/showPassword.png') : require('../../assets/icons/hidePassword.png')}
              style={styles.toggleIcon}
            />
          </TouchableWithoutFeedback>
        </View>
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#012768" />
          ) : (
            <Text style={styles.buttonText}>INICIAR</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={navigateToSignUpScreen}>
          <Text style={styles.registerButtonText}>Cadastre-se</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.footerText} onPress={navigateToPasswordResetScreen}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 210,
    height: 212.64,
    marginBottom: 15,
  },
  title: {
    color: '#FFD21F',
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    lineHeight: 54,
    textAlign: 'center',
    marginBottom: 15,
  },
  inputEmail: {
    width: 319,
    height: 63,
    backgroundColor: '#FFFFFF',
    borderRadius: 31.5,
    paddingHorizontal: 15,
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'Mulish',
    color: '#012768',
  },
  inputPasswordContainer: {
    flexDirection: 'row',
    width: 319,
    height: 63,
    backgroundColor: '#FFFFFF',
    borderRadius: 31.5,
    paddingHorizontal: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  inputPassword: {
    flex: 1,
    fontFamily: 'Mulish',
    fontSize: 18,
    color: '#012768',
  },
  toggleIcon: {
    width: 24,
    height: 24,
  },
  button: {
    width: 319,
    height: 63,
    backgroundColor: '#FFD21F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 31.5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#012768',
    fontSize: 24,
    fontFamily: 'Mulish-Bold',
  },
  registerButton: {
    width: 319,
    height: 63,
    backgroundColor: 'rgba(200, 196, 183, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 31.5,
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#012768',
    fontSize: 20,
    fontFamily: 'Mulish',
  },
  footerText: {
    color: '#FFD21F',
    fontSize: 16,
    fontFamily: 'Mulish',
    fontWeight: '300',
    lineHeight: 21,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF4D4D',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Mulish',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
