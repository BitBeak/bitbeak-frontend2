import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import QuizzQuestionScreen from './QuizzQuestionScreen';
import MatchColumnsScreen from './MatchColumnsScreen';
import CodeFillScreen from './CodeFillScreen';
import CodeQuestionScreen from './CodeQuestionScreen';
import { AuthContext } from '../context/AuthContext';

const QuestionScreen = ({ route }) => {
  const { userId, selectedLevel } = useContext(AuthContext);
  const { trailNumber, challengeData, isChallenge = false, challengeId = null, idNivel = null } = route.params || {};
  
  const [questionData, setQuestionData] = useState(challengeData ? challengeData : null);
  const [loading, setLoading] = useState(!challengeData);

  useEffect(() => {
    if (!challengeData && userId && trailNumber && selectedLevel) {
      const fetchQuestionData = async () => {
        const requestBody = {
          idTrilha: trailNumber,
          idNivelTrilha: selectedLevel,
          idUsuario: userId,
        };

        try {
          const response = await fetch('http://192.168.0.2:5159/api/Jogo/IniciarNivel', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          const data = await response.json();
          setQuestionData(data);
        } catch (error) {
          console.error('Erro ao buscar dados da questão:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchQuestionData();
    }
  }, [userId, trailNumber, selectedLevel, challengeData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando questão...</Text>
      </View>
    );
  }

  if (!questionData || !questionData.questao) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Questão não encontrada. Tente novamente.</Text>
      </View>
    );
  }

  const initialParams = {
    trailNumber: challengeData ? challengeData.idTrilha : trailNumber,
    currentQuestionIndex: 0,
    correctAnswers: 0,
    incorrectQuestions: [],
    questionsHistory: [],
    isChallenge,
    challengeId,
    idNivel: idNivel || (challengeData ? challengeData.questao.idNivel : selectedLevel),
  };

  switch (questionData.questao.tipo) {
    case 0:
      return (
        <QuizzQuestionScreen
          route={{
            params: {
              ...initialParams,
              question: {
                ...questionData.questao,
                question: questionData.questao.enunciado,
                codigo: questionData.questao.codigo,
                opcoes: questionData.questao.opcoes.map((opcao) => ({
                  texto: opcao.texto,
                  correta: opcao.correta,
                  idOpcao: opcao.idOpcao,
                })),
              },
            },
          }}
        />
      );
    case 1:
      return (
        <MatchColumnsScreen
          route={{
            params: {
              ...initialParams,
              question: {
                ...questionData.questao,
                idQuestao: questionData.questao.idQuestao,
                lacunas: questionData.questao.lacunas.map((lacuna) => ({
                  idLacuna: lacuna.idLacuna,
                  colunaA: lacuna.colunaA,
                  colunaB: lacuna.colunaB,
                })),
              },
            },
          }}
        />
      );
    case 2:
      return (
        <CodeQuestionScreen
          route={{
            params: {
              ...initialParams,
              question: {
                ...questionData.questao,
                idQuestao: questionData.questao.idQuestao,
                prompt: questionData.questao.enunciado,
                correctCode: questionData.questao.solucaoEsperada,
              },
            },
          }}
        />
      );
    case 3:
      return (
        <CodeFillScreen
          route={{
            params: {
              ...initialParams,
              question: {
                ...questionData.questao,
                enunciado: questionData.questao.enunciado,
                codigo: questionData.questao.codigo,
                solucaoEsperada: questionData.questao.solucaoEsperada,
              },
            },
          }}
        />
      );
    default:
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tipo de questão não suportado</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default QuestionScreen;
