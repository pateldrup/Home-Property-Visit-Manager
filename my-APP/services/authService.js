import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'user_session';

export const loginUser = async (email, password) => {
  try {
    // Mock login logic
      const session = {
      user: {
        name: 'VisitVault',
        email: email,
        id: 'agent_123',
      },
      token: 'mock_jwt_token',
    };
    
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    console.error('Login error', error);
    throw error;
  }
};

export const registerUser = async (email, password, name) => {
  try {
    // Mock register logic
    const session = {
      user: {
        name: name || 'New Agent',
        email: email,
        id: 'agent_' + Math.floor(Math.random() * 1000),
      },
      token: 'mock_jwt_token_register',
    };
    
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    console.error('Register error', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return true;
  } catch (error) {
    console.error('Logout error', error);
    return false;
  }
};

export const getSession = async () => {
  try {
    const data = await SecureStore.getItemAsync(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get session error', error);
    return null;
  }
};
