// Authentication utilities for local storage operations

export const saveUserToStorage = (userData) => {
  try {
    const users = getUsersFromStorage();
    
    // Check if username already exists
    if (users.find(user => user.username === userData.username)) {
      return { success: false, message: 'Username already exists' };
    }
    
    // Check if email already exists
    if (users.find(user => user.email === userData.email)) {
      return { success: false, message: 'Email already exists' };
    }
    
    // Add new user
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    return { success: false, message: 'Error saving user data' };
  }
};

export const getUsersFromStorage = () => {
  try {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    return [];
  }
};

export const validateLogin = (username, password) => {
  try {
    const users = getUsersFromStorage();
    const user = users.find(user => 
      user.username === username && user.password === password
    );
    
    if (user) {
      // Save current user session
      localStorage.setItem('currentUser', JSON.stringify({
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      }));
      return { success: true, message: 'Login successful', user };
    } else {
      return { success: false, message: 'Invalid username or password' };
    }
  } catch (error) {
    return { success: false, message: 'Error during login' };
  }
};

export const getCurrentUser = () => {
  try {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  try {
    localStorage.removeItem('currentUser');
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    return { success: false, message: 'Error during logout' };
  }
};
