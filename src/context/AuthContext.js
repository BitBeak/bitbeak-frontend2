import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null); 
  const [xp, setXp] = useState(0);
  const [feathers, setFeathers] = useState(0);
  const [level, setLevel] = useState(null); 
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(null);
  const [currentTrailNumber, setCurrentTrailNumber] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(null);
  const [trails, setTrails] = useState([
    { id: 1, title: 'Trilha I: Lógica de Programação', levelsCompleted: 0, totalLevels: 5, unlocked: true },
    { id: 2, title: 'Trilha II: Algoritmos', levelsCompleted: 0, totalLevels: 5, unlocked: false },
    { id: 3, title: 'Trilha III: Estruturas de Dados', levelsCompleted: 0, totalLevels: 5, unlocked: false },
    { id: 4, title: 'Trilha IV: POO', levelsCompleted: 0, totalLevels: 5, unlocked: false },
    { id: 5, title: 'Trilha V: Algoritmos Avançados', levelsCompleted: 0, totalLevels: 5, unlocked: false },
  ]);

  // Função para definir os dados do usuário logado após a autenticação
  const setUserFromApi = (userData) => {
    setUser(userData);
    if (userData.idUsuario) {
      setUserId(userData.idUsuario);
    }
  };

  // Função para definir vários dados do usuário a partir de uma única chamada
  const setUserData = ({ newLevel, newXp, newFeathers }) => {
    setLevel(newLevel);
    setXp(newXp);
    setFeathers(newFeathers);
  };

  const addXp = (amount) => {
    setXp(prevXp => {
      const newXp = prevXp + amount;
      if (newXp >= 100) {
        setLevel(prevLevel => prevLevel + 1);
        return newXp - 100;
      }
      return newXp;
    });
  };

  const addFeathers = (amount) => {
    setFeathers(prevFeathers => prevFeathers + amount);
  };

  const updateTrailProgress = (trailId, levelCompleted) => {
    setTrails((prevTrails) => {
      return prevTrails.map((trail) => {
        if (trail.id === trailId) {
          const updatedLevelsCompleted = Math.max(trail.levelsCompleted, levelCompleted);
          return {
            ...trail,
            levelsCompleted: updatedLevelsCompleted,
            unlocked: true,
          };
        }
        return trail;
      });
    });
  };

  // Função para incrementar o número da questão
  const incrementQuestionNumber = () => {
    setCurrentQuestionNumber((prevNumber) => prevNumber + 1);
  };

  // Função para resetar o número da questão
  const resetQuestionNumber = () => {
    setCurrentQuestionNumber(1);
  };

  // Função para selecionar a trilha
  const selectTrail = (trailId) => {
    setCurrentTrailNumber(trailId);
  };

  return (
    <AuthContext.Provider value={{
      user, userId, setUser: setUserFromApi, setUserData,
      xp, addXp, feathers, addFeathers, level,
      trails, updateTrailProgress, selectedLevel, setSelectedLevel,
      currentQuestionNumber, incrementQuestionNumber, resetQuestionNumber,
      currentTrailNumber, selectTrail, correctAnswers, setCorrectAnswers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
