import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';

const CodeFillScreen = ({ route }) => {
  const {
    question,
    nextScreenParams,
    currentQuestionIndex,
    trailNumber,
    correctAnswers = 0,
    incorrectQuestions = [],
  } = route.params;
  
  const navigation = useNavigation();
  const { userId, selectedLevel } = useContext(AuthContext);
  const [codeInput, setCodeInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  const handleSendPress = async () => {
    setIsSending(true);
    setIsInputDisabled(true);

    const resposta = {
      IdTrilha: trailNumber,
      IdNivelTrilha: selectedLevel,
      IdUsuario: userId,
      IdQuestaoAleatoria: question.idQuestao,
      RespostaUsuario: codeInput,
      QuestoesRespondidas: [],
    };

    console.log('Enviando para a API:', JSON.stringify(resposta, null, 2));

    try {
      const response = await fetch('http://192.168.0.2:5159/api/Jogo/ResponderQuestao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resposta),
      });

      console.log(`Status da resposta da API: ${response.status}`);

      if (!response.ok) {
        console.error(`Erro na resposta da API. Status: ${response.status}`);
        throw new Error('Erro ao enviar a resposta.');
      }

      const data = await response.json();
      const acertosAntes = correctAnswers;
      const acertosDepois = data.contadorAcertos;

      if (acertosDepois > acertosAntes) {
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }

      setShowFeedback(true);

      console.log('Resposta do servidor:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erro na requisição:', error);
      setIsCorrect(false);
      setShowFeedback(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleNextPress = () => {
    console.log('Navegando para a próxima questão com params:', JSON.stringify(nextScreenParams, null, 2));
    setShowFeedback(false);
    navigation.navigate('QuestionScreen', nextScreenParams);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <LinearGradient colors={['#012768', '#006FC2']} style={styles.container}>
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <Text style={styles.headerText}>TRILHA {trailNumber} - Q{currentQuestionIndex + 1}</Text>
                <Icon name="more-vert" size={30} color="#fff" />
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={['#FDD835', '#FBC02D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / 6) * 100}%` }]}
                  />
                </View>
              </View>
            </View>
            <View style={styles.body}>
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>{question.enunciado}</Text>
              </View>
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{question.codigo.replace('_______________', codeInput)}</Text>
              </View>
              <TextInput
                style={styles.codeInput}
                placeholder="Complete o código aqui"
                placeholderTextColor="#ccc"
                value={codeInput}
                onChangeText={setCodeInput}
                editable={!isInputDisabled}
              />
              <View style={styles.buttonContainer}>
                {!isSending && !showFeedback && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendPress}
                    disabled={isSending}
                  >
                    <Text style={styles.buttonText}>ENVIAR</Text>
                  </TouchableOpacity>
                )}
                {isSending && (
                  <ActivityIndicator size="small" color="#ffffff" />
                )}
              </View>
              {showFeedback && (
                <View style={[styles.modal, isCorrect ? styles.correctModal : styles.incorrectModal]}>
                  <Text style={styles.modalText}>{isCorrect ? 'EXCELENTE!' : 'ERRADO!'}</Text>
                  <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
                    <Text style={styles.nextButtonText}>Próxima →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 40,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#BDBDBD',
    borderRadius: 5,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: -150,
  },
  questionText: {
    color: '#005288',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  codeContainer: {
    backgroundColor: '#2E3A59',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '90%',
  },
  codeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  codeInput: {
    width: '90%',
    backgroundColor: '#2E3A59',
    color: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#007bff',
    width: '90%',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modal: {
    position: 'absolute',
    bottom: -10,
    width: '107%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  correctModal: {
    backgroundColor: '#00C853',
  },
  incorrectModal: {
    backgroundColor: '#D32F2F',
  },
  modalText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CodeFillScreen;
