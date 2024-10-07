import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomAlert from '../components/CustomAlert';

const COLORS = ['#FF7043', '#66BB6A', '#42A5F5', '#AB47BC'];

const MatchColumnsScreen = ({ route }) => {
  const {
    question,
    currentQuestionIndex,
    trailNumber,
    questionsHistory = [],
    correctAnswers = 0,
    incorrectQuestions = [],
    isChallenge = false,
    challengeId = null,
    idNivel = null,
  } = route.params;

  const navigation = useNavigation();
  const { userId, selectedLevel } = useContext(AuthContext);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [nextScreenParams, setNextScreenParams] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [turnEndedModalVisible, setTurnEndedModalVisible] = useState(false);

  useEffect(() => {
    setSelectedLeft(null);
    setSelectedRight(null);
    setPairs([]);
    setShowFeedback(false);
    setIsCorrect(false);
  }, [question]);

  const handleLeftSelect = (item) => {
    setSelectedLeft(item);
    if (selectedRight) {
      const newPairs = [
        ...pairs,
        {
          left: item,
          right: selectedRight,
          color: COLORS[pairs.length % COLORS.length],
          idLacuna: item.idLacuna,
        },
      ];
      setPairs(newPairs);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (newPairs.length === question.lacunas.length) {
        checkAnswers(newPairs);
      }
    }
  };

  const handleRightSelect = (item) => {
    setSelectedRight(item);
    if (selectedLeft) {
      const newPairs = [
        ...pairs,
        {
          left: selectedLeft,
          right: item,
          color: COLORS[pairs.length % COLORS.length],
          idLacuna: selectedLeft.idLacuna,
        },
      ];
      setPairs(newPairs);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (newPairs.length === question.lacunas.length) {
        checkAnswers(newPairs);
      }
    }
  };

  const checkAnswers = (finalPairs) => {
    responderQuestao(finalPairs);
  };

  const responderQuestao = async (finalPairs) => {
    const apiEndpoint = isChallenge
      ? 'http://192.168.0.2:5159/api/Desafio/ResponderQuestaoDesafio'
      : 'http://192.168.0.2:5159/api/Jogo/ResponderQuestao';

    const requestBody = {
      idDesafio: isChallenge ? challengeId : undefined,
      idTrilha: trailNumber,
      idUsuario: userId,
      idQuestaoAleatoria: question.idQuestao,
      idNivelTrilha: isChallenge ? idNivel : selectedLevel,
      questoesRespondidas: questionsHistory,
      contadorAcertos: correctAnswers,
      contadorErros: incorrectQuestions.length,
      respostasLacunas: finalPairs.map((pair) => ({
        idLacuna: pair.idLacuna,
        respostaColunaA: pair.left.colunaA,
        respostaColunaB: pair.right.colunaB,
      })),
    };

    console.log('Enviando para a API:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.text();
      console.log('Resposta da API:', JSON.stringify(responseData, null, 2));

      if (response.status === 400) {
        if (responseData.includes('O usuário já concluiu este nível.')) {
          setAlertTitle('Nível já concluído!');
          setAlertMessage(
            'Você já completou este nível anteriormente, mas pode continuar jogando para revisar as questões ou tentar melhorar sua pontuação.'
          );
          setAlertVisible(true);
        } else {
          console.error('Erro desconhecido ao enviar a resposta:', responseData);
          throw new Error('Erro desconhecido');
        }
      } else if (response.status === 200) {
        if (responseData.includes('Turno encerrado, agora é a vez do outro jogador.')) {
          // Mostrar modal indicando que o turno foi encerrado
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
            idNivel: route.params.idNivel,
          });

          setShowFeedback(true);
        }
      }
      } else {
        console.error('Erro inesperado ao enviar a resposta. Código:', response.status);
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
          navigation.navigate('QuizzQuestionScreen', nextScreenParams);
          break;
        case 1:
          navigation.navigate('MatchColumnsScreen', {
            ...nextScreenParams,
            key: `${nextScreenParams.question.idQuestao}-${Date.now()}`,
          });
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

  const isPaired = (item, side) => {
    return pairs.some((pair) => pair[side].colunaA === item.colunaA || pair[side].colunaB === item.colunaB);
  };

  const getPairedStyle = (item, side) => {
    const pair = pairs.find((pair) => pair[side].colunaA === item.colunaA || pair[side].colunaB === item.colunaB);
    if (pair) {
      return { backgroundColor: pair.color };
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#012768', '#006FC2']} style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>TRILHA {trailNumber} - Q{currentQuestionIndex + 1}</Text>
            <Icon name="more-vert" size={30} color="#ffffff" />
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
          <Text style={styles.title}>RELACIONE OS TERMOS!</Text>
          <View style={styles.leftColumn}>
            {question.lacunas.map((item) => (
              <TouchableOpacity
                key={`${item.idLacuna}-left`}
                style={[
                  styles.leftOption,
                  selectedLeft && selectedLeft.colunaA === item.colunaA && styles.selectedOption,
                  getPairedStyle(item, 'left'),
                ]}
                onPress={() => handleLeftSelect(item)}
                disabled={isPaired(item, 'left')}
              >
                <Text style={styles.optionText}>{item.colunaA}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.rightColumnContainer}>
            <View style={styles.rightColumn}>
              {question.lacunas.slice(0, Math.ceil(question.lacunas.length / 2)).map((item) => (
                <TouchableOpacity
                  key={`${item.idLacuna}-right`}
                  style={[
                    styles.rightOption,
                    selectedRight && selectedRight.colunaB === item.colunaB && styles.selectedOption,
                    getPairedStyle(item, 'right'),
                  ]}
                  onPress={() => handleRightSelect(item)}
                  disabled={isPaired(item, 'right')}
                >
                  <Text style={styles.optionText}>{item.colunaB}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.rightColumn}>
              {question.lacunas.slice(Math.ceil(question.lacunas.length / 2)).map((item) => (
                <TouchableOpacity
                  key={`${item.idLacuna}-right`}
                  style={[
                    styles.rightOption,
                    selectedRight && selectedRight.colunaB === item.colunaB && styles.selectedOption,
                    getPairedStyle(item, 'right'),
                  ]}
                  onPress={() => handleRightSelect(item)}
                  disabled={isPaired(item, 'right')}
                >
                  <Text style={styles.optionText}>{item.colunaB}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false);
          navigation.navigate('HomeScreen');
        }}
      />
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
  );
};

const styles = StyleSheet.create({
  // Estilos mantidos iguais aos anteriores para consistência visual
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
    marginTop: 5,
    marginBottom: -10,
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
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  leftColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  rightColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftOption: {
    width: 160,
    height: 70,
    backgroundColor: '#7DB3FF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  rightOption: {
    width: 160,
    height: 70,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  optionText: {
    color: '#012768',
    fontSize: 18,
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

export default MatchColumnsScreen;
