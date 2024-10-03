import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import QuizzQuestionScreen from './QuizzQuestionScreen';
import MatchColumnsScreen from './MatchColumnsScreen';
import CodeFillScreen from './CodeFillScreen';
import CodeQuestionScreen from './CodeQuestionScreen';

const SpecialQuestionScreen = ({ route }) => {
  const { perguntaEspecial, questao, ...rest } = route.params;
  const question = perguntaEspecial;
  const tipoQuestao = question.tipoQuestao || question.tipo;

  const [isModalVisible, setIsModalVisible] = useState(true);

  // Função para fechar o modal e permitir que o jogador continue
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Modal que aparece ao abrir a questão especial */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pergunta Especial!</Text>
            <Text style={styles.modalText}>
              Você chegou a uma pergunta especial. Responda com atenção para ganhar mais pontos e conquistar uma vantagem!
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>Entendi!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Renderizar a tela correta com base no tipo da questão */}
      {!isModalVisible && (
        (() => {
          switch (tipoQuestao) {
            case 0: // Quizz (Múltipla Escolha)
              return (
                <QuizzQuestionScreen
                  route={{ params: { ...rest, question } }}
                />
              );
            case 1: // Match Columns
              return (
                <MatchColumnsScreen
                  route={{ params: { ...rest, question } }}
                />
              );
            case 2: // Code Question
              return (
                <CodeQuestionScreen
                  route={{ params: { ...rest, question } }}
                />
              );
            case 3: // Code Fill
              return (
                <CodeFillScreen
                  route={{ params: { ...rest, question } }}
                />
              );
            default:
              return (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Tipo de questão especial desconhecido. Tente novamente.</Text>
                </View>
              );
          }
        })()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
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

export default SpecialQuestionScreen;
