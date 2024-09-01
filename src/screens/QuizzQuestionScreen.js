import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
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
    setSelectedOption(null);  // Reseta a seleção quando a tela é montada
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
        const response = await fetch('http://192.168.0.2:5159/api/Jogo/ResponderQuestao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resposta),
        });

        const responseData = await response.text();

        if (response.status === 400) {
            if (responseData.includes('O usuário já concluiu este nível.')) {
                // Caso o nível já tenha sido concluído anteriormente
                setAlertTitle('Nível já concluído!');
                setAlertMessage('Você já completou este nível anteriormente, mas pode continuar jogando para revisar as questões ou tentar melhorar sua pontuação.');
                setAlertVisible(true);
            } else {
                throw new Error('Erro desconhecido');
            }
        } else if (response.status === 200) {
            if (responseData.includes('Parabéns')) {
                // Caso o usuário tenha concluído o nível com sucesso
                setAlertTitle('Parabéns!');
                setAlertMessage('Você completou este nível e agora pode seguir para o nível seguinte.');
                setAlertVisible(true);
            } else {
                // Continue o processamento normal se não houver mensagem específica
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

    switch(tipo) {
      case 0:
        navigation.navigate('QuizzQuestionScreen', {
          ...nextScreenParams,
          key: `${nextScreenParams.question.idQuestao}-${Date.now()}`, // Gera uma chave única para forçar a recriação da tela
        });
        break;
      case 1:
        navigation.navigate('MatchColumnsScreen', nextScreenParams);
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
                style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / 6) * 100}%` }]}
              />
            </View>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.enunciado}</Text>
          </View>
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
        </View>
      </LinearGradient>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false); // Feche o modal
          navigation.navigate('HomeScreen'); // Navegue para HomeScreen após o fechamento do modal
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 55,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  questionText: {
    color: '#005288',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
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

export default QuizzQuestionScreen;
