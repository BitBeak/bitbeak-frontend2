import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import QuizzQuestionScreen from './QuizzQuestionScreen';
import MatchColumnsScreen from './MatchColumnsScreen';
import { AuthContext } from '../context/AuthContext';

const QuestionScreen = ({route}) => {
  const { trailNumber } = route.params;
  const { userId, selectedLevel } = useContext(AuthContext);
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !trailNumber || !selectedLevel) {
      console.error('Missing required data for API call');
      return;
    }

    const fetchQuestionData = async () => {
      const requestBody = {
        idTrilha: trailNumber,
        idNivelTrilha: selectedLevel,
        idUsuario: userId,
      };
  
      console.log('Request Body:', requestBody);

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

        console.log('API Response:', data);
        setQuestionData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [userId, trailNumber, selectedLevel]);

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

  switch (questionData.questao.tipo) {
    case 0:
      return (
        <QuizzQuestionScreen
          route={{
            params: {
              question: {
                ...questionData.questao,
                question: questionData.questao.enunciado,
                options: questionData.questao.opcoes.map(opcao => ({
                  text: opcao.texto,
                  correct: opcao.correta,
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
      trailNumber: trailNumber,
      question: {
        ...questionData.questao,
        idQuestao: questionData.questao.idQuestao,
        options: questionData.questao.lacunas.map(lacuna => ({
          idLacuna: lacuna.idLacuna,
          left: lacuna.colunaA,
          right: lacuna.colunaB,
        })),
      },
    }}}
  />
        );
      
    case 3:
      return (
        <View style={styles.codeFillContainer}>
          <Text style={styles.questionText}>{questionData.questao.enunciado}</Text>
          <Text style={styles.codeText}>{questionData.questao.codigo}</Text>
          <Text style={styles.warningText}>Aviso: Tipo CodeFill ainda não implementado.</Text>
        </View>
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
  codeFillContainer: {
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  codeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    marginVertical: 10,
  },
  warningText: {
    fontSize: 14,
    color: 'orange',
  },
});

export default QuestionScreen;
