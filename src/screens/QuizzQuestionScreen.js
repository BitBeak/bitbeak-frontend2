import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomAlert from '../components/CustomAlert';

const QuizzQuestionScreen = ({ route }) => {
  const { question, currentQuestionIndex, trailNumber, correctAnswers = 0, incorrectQuestions = [], questionsHistory = [] } = route.params;
  const navigation = useNavigation();
  const { userId, selectedLevel } = useContext(AuthContext);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [nextScreenParams, setNextScreenParams] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    setSelectedOption(null); 
    setIsCorrect(false);
    setShowFeedback(false);
  }, [question]);

  const handleOptionPress = async (index) => {
    setSelectedOption(index);
    const correct = question.opcoes[index].correta;
    setIsCorrect(correct);

    const resposta = {
        IdTrilha: trailNumber,
        IdNivelTrilha: selectedLevel,
        IdUsuario: userId,
        IdQuestaoAleatoria: question.idQuestao,
        IdOpcaoEscolhidaUsuario: question.opcoes[index].idOpcao,
        QuestoesRespondidas: questionsHistory,
        ContadorAcertos: correctAnswers,
        ContadorErros: incorrectQuestions.length,
    };

    console.log('Enviando para a API:', JSON.stringify(resposta, null, 2));

    try {
        const response = await fetch('http://192.168.0.16:5159/api/Jogo/ResponderQuestao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resposta),
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

  const formatCode = (code) => {
    return code
      .replace(/;/g, ';\n')     
      .replace(/{/g, '{\n  ')     
      .replace(/}/g, '\n}');       
  };

  const handleNextPress = () => {
    if (!nextScreenParams || !nextScreenParams.question) {
      console.error('nextScreenParams ou nextScreenParams.question não está definido');
      return;
    }

    setShowFeedback(false); 

    const { tipo } = nextScreenParams.question;

    switch(tipo) {
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
});

export default QuizzQuestionScreen;
