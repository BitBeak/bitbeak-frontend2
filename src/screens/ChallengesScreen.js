import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import Header from '../components/Header';
import NavBar from '../components/NavBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const ChallengesScreen = ({ navigation }) => {
  const { userId } = useContext(AuthContext);
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
  });
  const [challenges, setChallenges] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingChallenge, setRejectingChallenge] = useState(false);
  const [userName, setUserName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch(`http://192.168.0.16:5159/api/Usuarios/ListarDadosUsuario/${userId}`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados do usuário: ${response.status}`);
        }
        const userData = await response.json();
        setUserName(userData.nome);
      } catch (error) {
        console.error('Erro ao buscar o nome do usuário:', error);
      }
    };

    if (userId) {
      fetchUserName();
    }
  }, [userId]);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const ongoingResponse = await fetch(`http://192.168.0.16:5159/api/Desafio/ListarDesafiosAbertos/${userId}`);
      let ongoingChallenges = [];
      if (ongoingResponse.ok) {
        ongoingChallenges = await ongoingResponse.json();
      }

      const pendingResponse = await fetch(`http://192.168.0.16:5159/api/Desafio/ListarDesafiosPendentes/${userId}`);
      let pendingData = [];
      if (pendingResponse.ok) {
        pendingData = await pendingResponse.json();
      } else if (pendingResponse.status === 404) {
        console.log("Nenhum desafio pendente para esse usuário.");
      } else {
        throw new Error(`Erro ao buscar desafios pendentes: ${pendingResponse.status}`);
      }

      // Verificação adicional para definir se é a vez do usuário
      const updatedChallenges = await Promise.all(
        ongoingChallenges.map(async (challenge) => {
          try {
            const response = await fetch(`http://192.168.0.16:5159/api/Desafio/VerificarVez/${challenge.idDesafio}/${userId}`);
            if (response.ok) {
              const data = await response.json();
              const yourTurn = data.mensagem.includes('sua vez de jogar');
              console.log(`Desafio ID ${challenge.idDesafio}: yourTurn = ${yourTurn}`);
              return {
                ...challenge,
                yourTurn,
              };
            } else {
              console.error(`Erro ao verificar a vez para o desafio ${challenge.idDesafio}: ${response.status}`);
              return challenge;
            }
          } catch (error) {
            console.error(`Erro ao verificar a vez do desafio ${challenge.idDesafio}:`, error);
            return challenge;
          }
        })
      );

      setChallenges(updatedChallenges);
      setPendingChallenges(pendingData);
    } catch (error) {
      console.error('Erro ao buscar desafios:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchChallenges();
      }
    }, [userId, fetchChallenges])
  );

  const handleEnterChallenge = async (challengeId) => {
    try {
      const response = await fetch(`http://192.168.0.16:5159/api/Desafio/EntrarNoDesafio/${challengeId}/${userId}`);
      
      if (response.status === 400) {
        const responseData = await response.text();
        if (responseData === "Não é a sua vez de jogar.") {
          setModalMessage("Não é a sua vez de jogar. Aguarde o outro jogador.");
          setModalVisible(true);
        } else {
          setModalMessage("Ocorreu um erro ao tentar entrar no desafio.");
          setModalVisible(true);
        }
      } else if (response.status === 200) {
        const data = await response.json();
        const { questao } = data;
  
        // Navegar para a QuestionScreen com os dados da questão
        navigation.navigate('QuestionScreen', {
          trailNumber: data.idDesafio,
          challengeData: {
            questao: {
              idQuestao: questao.idQuestao,
              enunciado: questao.enunciado,
              tipo: questao.tipo,
              opcoes: questao.opcoes,
              lacunas: questao.lacunas,
              codeFill: questao.codeFill,
              codigo: questao.codigo,
              idNivel: questao.idNivel,
            },
          },
          isChallenge: true,
          challengeId: data.idDesafio,
          idNivel: questao.idNivel,
        });
      } else {
        setModalMessage(`Erro ao entrar no desafio: ${response.status}`);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Erro ao entrar no desafio:', error);
      setModalMessage("Não foi possível entrar no desafio. Tente novamente mais tarde.");
      setModalVisible(true);
    }
  };

  const handleNewGamePress = () => {
    navigation.navigate('FriendsListScreen');
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#012768', '#006FC2']} style={styles.gradientBackground}>
      <View style={styles.container}>
        <Header />
        <View style={styles.titleContainer}>
          <Text style={styles.titleHeader}>DESAFIOS</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
          {/* Botão "Desafie um amigo!" antes de todos os desafios */}
          <View style={styles.newGameContainer}>
            <View style={styles.iconContainer}>
              <Icon name="help-circle-outline" size={40} color="#FFD700" />
            </View>
            <View style={styles.textAndButtonContainer}>
              <Text style={styles.newGameLabel}>DESAFIE UM AMIGO!</Text>
              <TouchableOpacity style={styles.newGameButton} onPress={handleNewGamePress}>
                <Text style={styles.newGameButtonText}>NOVO JOGO</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de desafios */}
          {challenges.length > 0 &&
            challenges.map((item, index) => {
              const isPending = pendingChallenges.some((pending) => pending.idDesafio === item.idDesafio);

              const challengeMessage = (
                <>
                  {item.nomeDesafiante === userName ? (
                    <>
                      <Text style={styles.highlight}>Você</Text> <Text style={styles.highlight}>desafiou</Text>{' '}
                      <Text style={styles.opponent}>{item.nomeDesafiado}</Text> em {item.nomeTrilha}
                    </>
                  ) : (
                    <>
                      <Text style={styles.opponent}>{item.nomeDesafiante}</Text> <Text style={styles.highlight}>desafiou</Text>{' '}
                      <Text style={styles.highlight}>você</Text> em {item.nomeTrilha}
                    </>
                  )}
                </>
              );

              return (
                <TouchableOpacity
                  key={`${item.idDesafio}-${index}`}
                  style={styles.challengeCard}
                  onPress={() => handleEnterChallenge(item.idDesafio)}
                >
                  <View style={styles.iconContainer}>
                    <Icon name="account-circle" size={40} color="#FFF" />
                  </View>
                  {item.yourTurn && (
                    <View style={styles.sticker}>
                      <Text style={styles.stickerText}>SUA VEZ</Text>
                    </View>
                  )}
                  <View style={[styles.infoContainer, { paddingTop: 10 }]}>
                    <Text style={styles.challengeText}>{challengeMessage}</Text>
                    <View style={styles.actionRow}>
                      <View style={styles.scoreContainer}>
                        <Text style={styles.score}>INSÍGNIAS: {item.insigniaDesafiante} x {item.insigniasDesafiado}</Text>
                      </View>
                      {isPending && (
                        <TouchableOpacity
                          style={styles.rejectButton}
                          onPress={() => handleRejectChallenge(item.idDesafio)}
                          disabled={rejectingChallenge}
                        >
                          {rejectingChallenge ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <Text style={styles.rejectButtonText}>RECUSAR</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
        
        <NavBar navigation={navigation} currentScreen="ChallengesScreen" />
        <View style={styles.spacer} />

        {/* Modal de Sucesso/Erro Melhorado */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient colors={['#006FC2', '#012768']} style={styles.modalGradient}>
                <Text style={styles.modalTitle}>Aviso</Text>
                <Text style={styles.modalMessage}>{modalMessage}</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                >
                  <LinearGradient colors={['#FFD700', '#FFC700']} style={styles.modalButtonGradient}>
                    <Text style={styles.modalButtonText}>OK</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  titleHeader: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  scrollView: {
    marginTop: 20,
  },
  newGameContainer: {
    backgroundColor: '#74A7CC',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    marginVertical: 6,
  },
  textAndButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 15,
  },
  newGameLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#0A2A53',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  newGameButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    width: 140,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  newGameButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#0A2A53',
    fontWeight: 'bold',
  },
  challengeCard: {
    backgroundColor: '#74A7CC',
    padding: 12,
    borderRadius: 15,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#006FC2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  challengeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#012768',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  opponent: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  highlight: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  scoreContainer: {
    backgroundColor: '#012768',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  score: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: '#FFD700',
    textAlign: 'center',
  },
  rejectButton: {
    backgroundColor: '#FF0000',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  sticker: {
    position: 'absolute',
    top: -5, // Mover um pouco mais para cima
    right: 5,
    backgroundColor: '#ff7700', // Cor laranja
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 1,
  },
  stickerText: {
    color: '#012768',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButton: {
    marginTop: 10,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#012768',
    fontWeight: 'bold',
    fontSize: 18,
  },
  spacer: {
    height: 55,
  },
});

export default ChallengesScreen;
