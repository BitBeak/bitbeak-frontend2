import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomAlert from '../components/CustomAlert';

const COLORS = ['#FF7043', '#66BB6A', '#42A5F5', '#AB47BC'];

const MatchColumnsScreen = ({ route }) => {
  const { question, currentQuestionIndex, trailNumber, questionsHistory = [], correctAnswers = 0, incorrectQuestions = [] } = route.params;
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
  const idQuestao = question.idQuestao;

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
      const newPairs = [...pairs, {
        left: item,
        right: selectedRight,
        color: COLORS[pairs.length % COLORS.length],
        idLacuna: item.idLacuna
      }];
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
      const newPairs = [...pairs, {
        left: selectedLeft,
        right: item,
        color: COLORS[pairs.length % COLORS.length],
        idLacuna: selectedLeft.idLacuna
      }];
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
    const requestBody = {
      idTrilha: trailNumber,
      idNivelTrilha: selectedLevel,
      idUsuario: userId,
      idQuestaoAleatoria: idQuestao,
      QuestoesRespondidas: questionsHistory,
      ContadorAcertos: correctAnswers,
      ContadorErros: incorrectQuestions.length,
      respostasLacunas: finalPairs.map(pair => ({
        idLacuna: pair.idLacuna,
        respostaColunaA: pair.left.colunaA,
        respostaColunaB: pair.right.colunaB,
      })),
    };
  
    console.log('Enviando para a API:', JSON.stringify(requestBody, null, 2));
  
    try {
      const response = await fetch('http://192.168.0.2:5159/api/Jogo/ResponderQuestao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const responseData = await response.text();
  
      if (response.status === 400) {
        if (responseData.includes('O usuário já concluiu este nível.')) {
            setAlertTitle('Nível já concluído!');
            setAlertMessage('Você já completou este nível anteriormente, mas pode continuar jogando para revisar as questões ou tentar melhorar sua pontuação.');
            setAlertVisible(true);
        }  else {
            throw new Error('Erro desconhecido');
        }
    } else if (response.status === 200) {
        if (responseData.includes('Parabéns')) {
            setAlertTitle('Parabéns!');
            setAlertMessage('Você completou este nível e agora pode seguir para o nível seguinte.');
            setAlertVisible(true);
        } else if (responseData.includes('Jogo finalizado. Tente novamente!')) {
            setAlertTitle('Jogo finalizado!');
            setAlertMessage('Você errou um número considerável de questões, revise o conteúdo e tente novamente.');
            setAlertVisible(true);
        } else {
          const data = JSON.parse(responseData);
          console.log('Dados recebidos da API:', JSON.stringify(data, null, 2));
  
          const acertosAntes = correctAnswers;
          const acertosDepois = data.contadorAcertos;
          const acertou = acertosDepois > acertosAntes;
          setIsCorrect(acertou);
  
          const updatedHistory = data.questoesRespondidas;
  
          setNextScreenParams({
            question: {
              idQuestao: data.questao.idQuestao,
              enunciado: data.questao.enunciado,
              tipo: data.questao.tipo,
              opcoes: data.questao.opcoes,
              lacunas: data.questao.lacunas,
              codeFill: data.questao.codeFill,
              codigo: data.questao.codigo,
            },
            currentQuestionIndex: currentQuestionIndex + 1,
            trailNumber,
            correctAnswers: acertosDepois,
            incorrectQuestions: acertou ? incorrectQuestions : [...incorrectQuestions, question],
            questionsHistory: updatedHistory,
          });
  
          setShowFeedback(true);
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
  };

  const isPaired = (item, side) => {
    return pairs.some(pair => pair[side].colunaA === item.colunaA || pair[side].colunaB === item.colunaB);
  };

  const getPairedStyle = (item, side) => {
    const pair = pairs.find(pair => pair[side].colunaA === item.colunaA || pair[side].colunaB === item.colunaB);
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
    width: 165,
    height: 160,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 3,
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
});

export default MatchColumnsScreen;
