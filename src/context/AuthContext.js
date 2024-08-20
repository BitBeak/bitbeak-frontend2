import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [xp, setXp] = useState(0);
  const [feathers, setFeathers] = useState(0);
  const [level, setLevel] = useState(0);
  const [trails, setTrails] = useState([
    { id: 1, title: 'Trilha I: Lógica de Programação', levelsCompleted: 0, totalLevels: 5, unlocked: true },
    { id: 2, title: 'Trilha II: Algoritmos', levelsCompleted: 0, totalLevels: 5, unlocked: false },
    { id: 3, title: 'Trilha III: Estruturas de Dados', levelsCompleted: 0, totalLevels: 5, unlocked: false },
    { id: 4, title: 'Trilha IV: Programação Orientada a Objetos', levelsCompleted: 0, totalLevels: 5, unlocked: false },
    { id: 5, title: 'Trilha V: Algoritmos Avançados', levelsCompleted: 0, totalLevels: 5, unlocked: false },
  ]);

  const registerUser = (email, password) => {
    setUsers(prevUsers => [...prevUsers, { email, password }]);
  };

  const validateUser = (email, password) => {
    return users.some(user => user.email === email && user.password === password);
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

  return (
    <AuthContext.Provider value={{ registerUser, validateUser, xp, addXp, feathers, addFeathers, level, trails, updateTrailProgress }}>
      {children}
    </AuthContext.Provider>
  );
};