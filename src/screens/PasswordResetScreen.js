import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

const PasswordResetScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [stage, setStage] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestToken = async () => {
    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://192.168.0.2:5159/api/Usuarios/TokenResetarSenha',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(email.trim()),
        }
      );

      const text = await response.text();
      console.log('Token Request API Response:', text);

      if (response.ok) {
        setStage(2);
        setModalTitle('Token enviado');
        setModalMessage('Um token de recuperação de senha foi enviado para o seu e-mail. Utilize-o para redefinir a sua senha.');
        setModalVisible(true);
      } else {
        if (response.status === 404) {
          setError('Usuário não encontrado.');
        } else {
          setError('Erro ao solicitar o token. Tente novamente mais tarde.');
        }
      }
    } catch (error) {
      console.error('Network or server error:', error);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token.trim()) {
      setError('O token é obrigatório.');
      return;
    }
    if (!newPassword) {
      setError('A nova senha é obrigatória.');
      return;
    }
    if (newPassword.length < 8) {
      setError('A senha precisa ter no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://192.168.0.2:5159/api/Usuarios/RedefinirSenha',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token.trim(),
            novaSenha: newPassword,
          }),
        }
      );

      const text = await response.text();
      console.log('Password Reset API Response:', text);

      if (response.ok) {
        setModalTitle('Senha redefinida');
        setModalMessage('Sua senha foi redefinida com sucesso! Você será redirecionado para a tela de Login.');
        setModalVisible(true);
      } else {
        if (response.status === 400) {
          setError('Token inválido ou expirado.');
        } else {
          setError('Erro ao redefinir a senha. Tente novamente mais tarde.');
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
    if (stage === 2 && modalTitle === 'Senha redefinida') {
      navigation.navigate('LoginScreen');
    }
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
        <Text style={styles.title}>
          {stage === 1 ? 'REDEFINIR SENHA' : 'NOVA SENHA'}
        </Text>
        {stage === 1 ? (
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="E-mail"
            keyboardType="email-address"
            placeholderTextColor="#012768"
            autoCapitalize="none"
            returnKeyType="done"
          />
        ) : (
          <>
            <TextInput
              style={styles.input}
              onChangeText={setToken}
              value={token}
              placeholder="Token"
              placeholderTextColor="#012768"
              autoCapitalize="none"
              returnKeyType="next"
            />
            <View style={styles.inputPasswordContainer}>
              <TextInput
                style={styles.inputPassword}
                onChangeText={setNewPassword}
                value={newPassword}
                secureTextEntry={!passwordVisible}
                placeholder="Nova Senha"
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
          </>
        )}
        {error !== '' && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={stage === 1 ? handleRequestToken : handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#012768" />
          ) : (
            <Text style={styles.actionButtonText}>
              {stage === 1 ? 'SOLICITAR TOKEN' : 'REDEFINIR SENHA'}
            </Text>
          )}
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
            <Text style={styles.modalTitle}>
              {modalTitle}
            </Text>
            <Text style={styles.modalMessage}>
              {modalMessage}
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
  },
  actionButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFD21F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 27.5,
    marginTop: 20,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#012768',
    fontFamily: 'Mulish-Bold',
    fontSize: 20,
    fontWeight: '700',
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

export default PasswordResetScreen;
