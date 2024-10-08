import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomAlert from '../components/CustomAlert';
import beautify from 'js-beautify';

const QuizzQuestionScreen = ({ route }) => {
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

  const navigation = useNavigation();
  const { userId, selectedLevel } = useContext(AuthContext);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [nextScreenParams, setNextScreenParams] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [turnEndedModalVisible, setTurnEndedModalVisible] = useState(false);

  const formatCode = (code) => {
    return beautify.js(code, { 
      "indent_size": "2",
      "indent_char": " ",
      "max_preserve_newlines": "5",
      "preserve_newlines": true,
      "keep_array_indentation": false,
      "break_chained_methods": false,
      "indent_scripts": "normal",
      "brace_style": "collapse",
      "space_before_conditional": false,
      "unescape_strings": false,
      "jslint_happy": false,
      "end_with_newline": false,
      "wrap_line_length": "0",
      "indent_inner_html": false,
      "comma_first": false,
      "e4x": false,
      "indent_empty_lines": false    
    });
  };

  useEffect(() => {
    setSelectedOption(null); 
    setIsCorrect(false);
    setShowFeedback(false);
  }, [question]);

  const handleOptionPress = async (index) => {
    setSelectedOption(index);
    const correct = question.opcoes[index].correta;
    setIsCorrect(correct);

    const apiEndpoint = isChallenge
      ? 'http://192.168.0.2:5159/api/Desafio/ResponderQuestaoDesafio'
      : 'http://192.168.0.2:5159/api/Jogo/ResponderQuestao';

    const resposta = {
      idDesafio: isChallenge ? challengeId : undefined,
      idTrilha: trailNumber,
      idNivelTrilha: isChallenge ? idNivel : selectedLevel,
      idUsuario: userId,
      idQuestaoAleatoria: question.idQuestao,
      idOpcaoEscolhidaUsuario: question.opcoes[index].idOpcao,
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
          setChallengeModalVisible(true);
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
        } else if (responseData.includes('Jogo finalizado. Tente novamente!')){
          console.log(response.status);
          Alert.alert(
            'Jogo finalizado!',
            'Tente novamente!',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('HomeScreen');
                },
              },
            ],
            { cancelable: false }
          ); 
        } else if (responseData.includes('Parabéns! Você concluiu o nível')){
          Alert.alert(
            'Parabéns!',
            'Você concluiu o nível!',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('HomeScreen');
                },
              },
            ],
            { cancelable: false }
          );
        } 
        
        else {
          const data = JSON.parse(responseData);
          const acertosDepois = data.contadorAcertos;
          const acertou = acertosDepois > correctAnswers;
          setIsCorrect(acertou);

          const updatedHistory = data.questoesRespondidas;
          const nextQuestion = data.perguntaEspecial || data.questao;

          if (nextQuestion && nextQuestion.idQuestao) {
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
                opcoes: nextQuestion.opcoes,
                lacunas: nextQuestion.lacunas,
                codeFill: nextQuestion.codeFill,
                codigo: nextQuestion.codigo,
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

          } else {
            console.error('Erro: A próxima questão não está devidamente definida.');
          }
        }
      } else {
        throw new Error(`Erro ao enviar a resposta: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
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
          navigation.navigate('QuizzQuestionScreen', {
            ...nextScreenParams,
            key: `${nextScreenParams.question.idQuestao}-${Date.now()}`,
          });
          break;
        case 1:
          navigation.navigate('MatchColumnsScreen', nextScreenParams);
          break;
        case 2:
          navigation.navigate('CodeQuestionScreen', nextScreenParams);
          break;  
        case 3:
          navigation.navigate('CodeFillScreen', nextScreenParams);
          break;
        default:
          console.error('Tipo de questão desconhecido:', tipo);
          break;
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
                style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / 7) * 100}%` }]}
              />
            </View>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.enunciado}</Text>
          </View>
          {question.codigo && (
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{formatCode(question.codigo)}</Text>
            </View>
          )}
          {question.opcoes && question.opcoes.length > 0 ? (
            question.opcoes.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  selectedOption === index && styles.selectedOption,
                ]}
                onPress={() => handleOptionPress(index)}
                disabled={selectedOption !== null}
              >
                <Text style={[
                  styles.buttonText,
                  selectedOption === index && styles.selectedButtonText,
                ]}>{option.texto}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>Nenhuma opção disponível</Text>
          )}
        </ScrollView>
        {selectedOption !== null && (
          <View style={[
            styles.modal,
            isCorrect ? styles.correctModal : styles.incorrectModal,
          ]}>
            <Text style={styles.modalText}>{isCorrect ? 'EXCELENTE!' : 'ERRADO!'}</Text>
            <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
              <Text style={styles.nextButtonText}>Próxima →</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false); 
          navigation.navigate('HomeScreen');
        }}
      />
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
      <Modal
        visible={challengeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <View style={styles.challengeModalContainer}>
          <View style={styles.challengeModalContent}>
            <Text style={styles.challengeModalText}>
              Insígnia conquistada e turno encerrado, agora é a vez do outro jogador.
            </Text>
            <TouchableOpacity
              style={styles.challengeModalButton}
              onPress={() => {
                setChallengeModalVisible(false);
                navigation.navigate('ChallengesScreen');
              }}
            >
              <Text style={styles.challengeModalButtonText}>OK</Text>
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
    marginBottom: -30,
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
    paddingVertical: 10,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  questionText: {
    color: '#005288',
    fontSize: 20,
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
  button: {
    marginBottom: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    borderRadius: 10,
    width: '90%',
  },
  selectedOption: {
    backgroundColor: '#FDD835',
    borderColor: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedButtonText: {
    color: '#005288',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    width: '110%',
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

export default QuizzQuestionScreen;
