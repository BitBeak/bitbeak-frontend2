import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Modal, Alert, Clipboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';

const FriendsListScreen = ({ navigation }) => {
  const { userId } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [trilhaModalVisible, setTrilhaModalVisible] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [removingFriendId, setRemovingFriendId] = useState(null);
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  const [trails, setTrails] = useState([
    { id: 1, title: 'Trilha I: Lógica de Programação', levelsCompleted: 0, totalLevels: 5 },
    { id: 2, title: 'Trilha II: Algoritmos', levelsCompleted: 0, totalLevels: 5 },
    { id: 3, title: 'Trilha III: Estruturas de Dados', levelsCompleted: 0, totalLevels: 5 },
    { id: 4, title: 'Trilha IV: POO', levelsCompleted: 0, totalLevels: 5 },
    { id: 5, title: 'Trilha V: Algoritmos Avançados', levelsCompleted: 0, totalLevels: 5 },
  ]);

  const fetchUserCode = async () => {
    try {
      console.log('Buscando código de amizade do usuário...');
      const response = await fetch(`http://192.168.0.2:5159/api/Usuarios/ListarDadosUsuario/${userId}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Dados do usuário recebidos:', data);
        setUserCode(data.codigoDeAmizade);
      } else {
        console.error('Erro ao buscar dados do usuário. Código da resposta:', response.status);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      console.log('Buscando lista de amigos...');
      const response = await fetch(`http://192.168.0.2:5159/api/Amizade/ListarAmigos/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Lista de amigos recebida:', data);
        setFriends(data);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Erro ao buscar amigos:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCode();
    fetchFriends();
  }, [userId]);

  const handleAddFriend = async () => {
    if (!friendCode.trim()) {
      console.error("Por favor, insira um código válido para adicionar um amigo.");
      return;
    }

    setIsAddingFriend(true);

    try {
      console.log('Adicionando amigo com código:', friendCode);
      const response = await fetch(`http://192.168.0.2:5159/api/Amizade/AdicionarAmigo?intIdUsuario=${userId}&strCodigoAmizadeAmigo=${friendCode}`, {
        method: 'POST',
      });

      if (response.ok) {
        console.log('Amigo adicionado com sucesso.');
        setModalVisible(false);
        setFriendCode('');
        fetchFriends();
      } else {
        console.error('Falha ao adicionar amigo. Código da resposta:', response.status);
      }
    } catch (error) {
      console.error("Erro ao adicionar amigo:", error);
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setRemovingFriendId(friendId);

    try {
      console.log(`Removendo amigo com ID: ${friendId}`);
      const response = await fetch(`http://192.168.0.2:5159/api/Amizade/RemoverAmizade/${userId}/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Amigo removido com sucesso.');
        setFriends((prevFriends) => prevFriends.filter((friend) => friend.idUsuario !== friendId));
      } else {
        console.error('Erro ao remover amizade. Código da resposta:', response.status);
      }
    } catch (error) {
      console.error('Erro ao tentar remover o amigo:', error);
    } finally {
      setRemovingFriendId(null);
    }
  };

  const handleChallengeFriend = (friendId) => {
    console.log(`Amigo selecionado para desafio: ${friendId}`);
    setSelectedFriendId(friendId);
    setTrilhaModalVisible(true);
  };

  const handleSelectTrilha = async (trilha) => {
    setTrilhaModalVisible(false);
    setLoading(true);
  
    const requestBody = {
      idDesafiante: userId,
      idDesafiado: selectedFriendId,
      idTrilha: trilha.id,
    };
  
    console.log('Iniciando desafio com os dados:', requestBody);
  
    try {
      const response = await fetch('http://192.168.0.2:5159/api/Desafio/IniciarDesafio', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Desafio iniciado com sucesso:', data);
        console.log('idNivel recebido da API:', data.questao.idNivel);

        navigation.navigate('QuestionScreen', {
          challengeData: data,
          trailNumber: trilha.id,
          isChallenge: true,
          challengeId: data.idDesafio,
          idNivel: data.questao.idNivel
        });
      } else if (response.status === 400) {
        const responseBody = await response.text();
        if (responseBody.includes('Já existe um desafio em andamento entre esses usuários')) {
          console.warn('Já existe um desafio em andamento entre esses usuários.');
          Alert.alert(
            'Desafio em Andamento',
            'Já existe um desafio em andamento entre esses usuários. Conclua o desafio atual antes de iniciar outro.',
            [{ text: 'OK' }]
          );
        } else {
          console.error('Erro ao iniciar o desafio. Resposta da API:', responseBody);
        }
      } else {
        console.error('Falha ao iniciar o desafio. Código da resposta:', response.status);
      }
    } catch (error) {
      console.error('Erro ao iniciar o desafio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loadingIndicator} />;
  }

  return (
    <LinearGradient colors={['#012768', '#006FC2']} style={styles.gradientBackground}>
      <View style={styles.container}>
        <Text style={styles.header}>ESCOLHA UM AMIGO PARA DESAFIAR</Text>
        <View style={styles.userCodeContainer}>
        <Text style={styles.userCodeText}>Seu Código de Amizade: {userCode}</Text>
        </View>

        {friends.length === 0 ? (
          <View style={styles.noFriendsContainer}>
            <Icon name="account-group-outline" size={100} color="#FFD700" style={styles.noFriendsIcon} />
            <Text style={styles.noFriendsText}>Você ainda não tem amigos adicionados.</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
              <Icon name="account-plus" size={30} color="#0A2A53" />
              <Text style={styles.addButtonText}>Adicionar novo amigo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.idUsuario.toString()}
              renderItem={({ item }) => (
                <View style={styles.friendCard}>
                  <View style={styles.iconContainer}>
                    <Icon name="account-circle" size={40} color="#FFF" />
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.friendName}>{item.nome}</Text>
                    <Text style={styles.friendLevel}>Nível: {item.nivelUsuario}</Text>
                    <TouchableOpacity onPress={() => handleChallengeFriend(item.idUsuario)} style={styles.challengeButton}>
                      <Text style={styles.challengeButtonText}>Desafiar</Text>
                    </TouchableOpacity>
                  </View>
                  {removingFriendId === item.idUsuario ? (
                    <ActivityIndicator size="small" color="#FF0000" style={styles.removeLoading} />
                  ) : (
                    <TouchableOpacity onPress={() => handleRemoveFriend(item.idUsuario)} style={styles.removeButton}>
                      <Icon name="account-remove" size={24} color="#FF0000" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              contentContainerStyle={styles.flatListContent}
            />
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
              <Icon name="account-plus" size={30} color="#0A2A53" />
              <Text style={styles.addButtonText}>Adicionar novo amigo</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={trilhaModalVisible}
          onRequestClose={() => setTrilhaModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Escolha a Trilha</Text>
              <Text style={styles.modalDescription}>
                Selecione uma trilha para desafiar seu amigo. Vamos ver quem consegue ir mais longe!
              </Text>
              <FlatList
                data={trails}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectTrilha(item)} style={styles.trilhaButton}>
                    <Text style={styles.trilhaButtonText}>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={() => setTrilhaModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Adicionar novo amigo</Text>
              <Text style={styles.modalDescription}>Insira o código do amigo abaixo para adicioná-lo à sua lista e começar os desafios juntos!</Text>
              {isAddingFriend ? (
                <ActivityIndicator size="large" color="#006FC2" />
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Código do Amigo"
                    placeholderTextColor="#888"
                    value={friendCode}
                    onChangeText={setFriendCode}
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddFriend} style={styles.addButtonModal}>
                      <Text style={styles.addButtonTextModal}>Adicionar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  header: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFriendsContainer: {
    alignItems: 'center',
  },
  noFriendsIcon: {
    marginBottom: 10,
  },
  noFriendsText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  friendCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flatListContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#006FC2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  friendName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#0A2A53',
  },
  friendLevel: {
    fontSize: 14,
    color: '#555',
    marginTop: -5,
  },
  challengeButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  challengeButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#0A2A53',
    textAlign: 'center',
  },
  removeButton: {
    padding: 10,
    marginLeft: 10,
  },
  removeLoading: {
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    paddingHorizontal: 20,
  },
  addButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#0A2A53',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#012768',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#012768',
    marginBottom: 20,
    fontSize: 16,
    padding: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  cancelButtonText: {
    color: '#FF0000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButtonModal: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    marginLeft: 10,
  },
  addButtonTextModal: {
    color: '#0A2A53',
    fontWeight: 'bold',
    fontSize: 16,
  },
  trilhaButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
  },
  trilhaButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#0A2A53',
  },
  userCodeContainer: {
    backgroundColor: '#012768',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  userCodeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
  },
});

export default FriendsListScreen;
