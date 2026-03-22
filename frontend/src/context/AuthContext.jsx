import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const agencyName = localStorage.getItem('agencyName');
    if (token) {
      setUser({ token, agencyName });
    }
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('agencyName', data.agencyName);
    setUser({ token: data.token, agencyName: data.agencyName });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('agencyName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
