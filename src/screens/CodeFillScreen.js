import React, { useState, useContext, useEffect } from 'react';
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
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

const CodeFillScreen = ({ route }) => {
  const {
    question,
    currentQuestionIndex,
    trailNumber,
    correctAnswers = 0,
    incorrectQuestions = [],
    questionsHistory = [],
    isChallenge = false,
    challengeId = null,
    idNivel = null,
  } = route.params;

  useEffect(() => {
    console.log("Parâmetros recebidos na tela de CodeFill:", route.params);
  }, [route.params]);

  const navigation = useNavigation();
  const { userId, selectedLevel } = useContext(AuthContext);
  const [codeInput, setCodeInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [nextScreenParams, setNextScreenParams] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [turnEndedModalVisible, setTurnEndedModalVisible] = useState(false);

  useEffect(() => {
    setCodeInput('');
    setIsInputDisabled(false);
  }, [question]);

  const formatCode = (code) => {
    return code
      .replace(/;/g, ';\n')
      .replace(/{/g, '{\n  ')
      .replace(/}/g, '\n}');
  };

  const handleSendPress = async () => {
    setIsSending(true);
    setIsInputDisabled(true);

    const apiEndpoint = isChallenge
      ? 'http://192.168.0.2:5159/api/Desafio/ResponderQuestaoDesafio'
      : 'http://192.168.0.2:5159/api/Jogo/ResponderQuestao';

    const resposta = {
      idDesafio: isChallenge ? challengeId : undefined,
      idTrilha: trailNumber,
      idNivelTrilha: isChallenge ? idNivel : selectedLevel,
      idUsuario: userId,
      idQuestaoAleatoria: question.idQuestao,
      respostaUsuario: codeInput,
      questoesRespondidas: questionsHistory,
      contadorAcertos: correctAnswers,
      contadorErros: incorrectQuestions.length,
    };

    console.log('Enviando para a API:', JSON.stringify(resposta, null, 2));

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resposta),
      });

      const responseData = await response.text();
      console.log('Resposta da API:', JSON.stringify(responseData, null, 2));

      if (response.status === 400) {
        if (responseData.includes('O usuário já concluiu este nível.')) {
          setAlertTitle('Nível já concluído!');
          setAlertMessage('Você já completou este nível anteriormente, mas pode continuar jogando para revisar as questões ou tentar melhorar sua pontuação.');
          setAlertVisible(true);
        } else {
          throw new Error('Erro desconhecido');
        }
      } else if (response.status === 200) {
        if (responseData.includes('Turno encerrado, agora é a vez do outro jogador.')) {
          setTurnEndedModalVisible(true);
        } else if (responseData.includes('Insígnia conquistada e turno encerrado, agora é a vez do outro jogador.')) {
          Alert.alert(
            'Insígnia Conquistada!',
            'Insígnia conquistada e turno encerrado, agora é a vez do outro jogador.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('ChallengesScreen');
                },
              },
            ],
            { cancelable: false }
          );
        } else if (responseData.includes('Jogo finalizado! O jogador ganhou todas as insígnias.')){
          Alert.alert(
            'Jogo finalizado!',
            'Parabéns, você venceu!',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('ChallengesScreen');
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          const data = JSON.parse(responseData);

          const acertosAntes = correctAnswers;
          const acertosDepois = data.contadorAcertos;
          const acertou = acertosDepois > acertosAntes;
          setIsCorrect(acertou);

          const updatedHistory = data.questoesRespondidas;

          const nextQuestion = data.perguntaEspecial || data.questao;

          let tipoQuestao = nextQuestion.tipo !== undefined ? nextQuestion.tipo : nextQuestion.tipoQuestao;

          if (tipoQuestao === 4) {
            if (nextQuestion.opcoes && nextQuestion.opcoes.length > 0) {
              tipoQuestao = 0; // Quizz (Múltipla Escolha)
            } else if (nextQuestion.lacunas && nextQuestion.lacunas.length > 0) {
              tipoQuestao = 1; // Match Columns
            } else if (nextQuestion.solucaoEsperada && nextQuestion.codigo) {
              tipoQuestao = 2; // Code Question
            } else if (nextQuestion.codigo && !nextQuestion.solucaoEsperada) {
              tipoQuestao = 3; // Code Fill
            } else {
              console.error('Erro: Tipo de questão especial não pôde ser determinado.');
            }
          }

          setNextScreenParams({
            question: {
              idQuestao: nextQuestion.idQuestao,
              enunciado: nextQuestion.enunciado,
              tipo: tipoQuestao,
              lacunas: nextQuestion.lacunas,
              codeFill: nextQuestion.codeFill,
              codigo: nextQuestion.codigo,
              opcoes: nextQuestion.opcoes,
            },
            currentQuestionIndex: currentQuestionIndex + 1,
            trailNumber,
            correctAnswers: acertosDepois,
            incorrectQuestions: acertou ? incorrectQuestions : [...incorrectQuestions, question],
            questionsHistory: updatedHistory,
            isChallenge,
            challengeId,
            idNivel: isChallenge ? idNivel : selectedLevel,
          });

          setShowFeedback(true);
        }
      } else {
        throw new Error(`Erro ao enviar a resposta: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setIsCorrect(false);
      setShowFeedback(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleNextPress = () => {
    if (!nextScreenParams || !nextScreenParams.question) {
      console.error('nextScreenParams ou nextScreenParams.question não está definido');
      return;
    }

    setShowFeedback(false);

    const { tipo } = nextScreenParams.question;

    if (tipo === 4) {
      navigation.navigate('SpecialQuestionScreen', {
        ...nextScreenParams,
        key: `${nextScreenParams.question.idQuestao}-${Date.now()}`,
      });
    } else {
      switch (tipo) {
        case 0:
          navigation.navigate('QuizzQuestionScreen', nextScreenParams);
          break;
        case 1:
          navigation.navigate('MatchColumnsScreen', nextScreenParams);
          break;
        case 2:
          navigation.navigate('CodeQuestionScreen', nextScreenParams);
          break;
        case 3:
          navigation.navigate('CodeFillScreen', {
            ...nextScreenParams,
            key: `${nextScreenParams.question.idQuestao}-${Date.now()}`,
          });
          break;
        default:
          console.error('Tipo de questão desconhecido:', tipo);
          break;
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <LinearGradient colors={['#012768', '#006FC2']} style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
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
                      style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / 7) * 100}%` }]}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.body}>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>{question.enunciado}</Text>
                </View>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{formatCode(question.codigo).replace('_______________', codeInput)}</Text>
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
              </View>
            </ScrollView>
          </LinearGradient>
        </KeyboardAvoidingView>
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => {
            setAlertVisible(false);
            navigation.navigate('HomeScreen');
          }}
        />
        {showFeedback && (
          <View style={[styles.modal, isCorrect ? styles.correctModal : styles.incorrectModal]}>
            <Text style={styles.modalText}>{isCorrect ? 'EXCELENTE!' : 'ERRADO!'}</Text>
            <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
              <Text style={styles.nextButtonText}>Próxima →</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Modal para indicar que o turno foi encerrado */}
        <Modal
          visible={turnEndedModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setTurnEndedModalVisible(false)}
        >
          <View style={styles.challengeModalContainer}>
            <View style={styles.challengeModalContent}>
              <Text style={styles.challengeModalText}>
                Turno encerrado, agora é a vez do outro jogador.
              </Text>
              <TouchableOpacity
                style={styles.challengeModalButton}
                onPress={() => {
                  setTurnEndedModalVisible(false);
                  navigation.navigate('ChallengesScreen');
                }}
              >
                <Text style={styles.challengeModalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 30,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    bottom: 0,
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
  challengeModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  challengeModalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  challengeModalText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  challengeModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#006FC2',
    borderRadius: 10,
  },
  challengeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CodeFillScreen;
