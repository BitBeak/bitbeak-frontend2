
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';

const CodeQuestionScreen = ({ route }) => {
  const { question, nextScreenParams, currentQuestionIndex, trailNumber, correctAnswers = 0, incorrectQuestions = [] } = route.params;
  const navigation = useNavigation();
  const { addXp, addFeathers } = useContext(AuthContext);
  const [code, setCode] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleTestPress = () => {
    const correct = testCode(code, question.correctCode);
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleSendPress = () => {
    if (isCorrect) {
      addXp(10);
      addFeathers(10);
      nextScreenParams.correctAnswers = correctAnswers + 1;
    } else {
      if (!Array.isArray(nextScreenParams.incorrectQuestions)) {
        nextScreenParams.incorrectQuestions = [];
      }
      nextScreenParams.incorrectQuestions.push(question);
      nextScreenParams.correctAnswers = correctAnswers;
    }
    setShowFeedback(false);
    navigation.navigate('QuestionScreen', nextScreenParams);
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
            <Text style={styles.questionText}>{question.prompt}</Text>
          </View>
          <TextInput
            style={styles.codeInput}
            multiline
            numberOfLines={10}
            onChangeText={setCode}
            value={code}
            placeholder="<Escreva seu código aqui>"
            placeholderTextColor="#ddd"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.testButton} onPress={handleTestPress}>
              <Text style={styles.buttonText}>TESTAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={handleSendPress}>
              <Text style={styles.buttonText}>ENVIAR</Text>
            </TouchableOpacity>
          </View>
          {showFeedback && (
            <View style={[styles.modal, isCorrect ? styles.correctModal : styles.incorrectModal]}>
              <Text style={styles.modalText}>{isCorrect ? 'EXCELENTE!' : 'ERRADO!'}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
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
    paddingVertical: 40,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  questionText: {
    color: '#005288',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  codeInput: {
    width: '90%',
    backgroundColor: '#2E3A59',
    color: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  testButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
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

const testCode = (userCode, correctCode) => {
  return userCode === correctCode;
};

export default CodeQuestionScreen;
