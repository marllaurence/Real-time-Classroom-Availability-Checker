import * as Crypto from 'expo-crypto';
import { runQuery, runTransaction } from '../db/database';

// --- 1. HASH PASSWORD (SECURITY) ---
const hashPassword = async (password: string) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return digest;
};

// --- 2. REGISTER (STUDENTS ONLY) ---
export const registerUser = async (fullName: string, email: string, password: string, role: 'admin' | 'user') => {
  try {
    // Check if email already exists
    const existingUsers = runQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return { success: false, message: 'Email already registered' };
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Save to Database
    runTransaction(
      'INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)',
      [fullName, email, hashedPassword, role]
    );

    return { success: true, message: 'User created successfully' };
  } catch (error) {
    return { success: false, message: 'Database error: ' + error };
  }
};

// --- 3. LOGIN (ADMIN + STUDENTS) ---
export const loginUser = async (email: string, password: string) => {
  try {
    // A. HARDCODED ADMIN CHECK
    // If they type 'admin' and 'admin123', let them in as Admin.
    if (email.toLowerCase() === 'admin' && password === 'admin123') {
      return { 
        success: true, 
        user: { 
          id: 999, 
          fullName: 'System Administrator', 
          email: 'admin', 
          role: 'admin' 
        } 
      };
    }

    // B. DATABASE CHECK (STUDENTS)
    const users = runQuery('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const user = users[0];

    // Verify Password
    const hashedPassword = await hashPassword(password);
    if (hashedPassword !== user.password) {
      return { success: false, message: 'Invalid credentials' };
    }

    return { success: true, user: user };
  } catch (error) {
    return { success: false, message: 'Login error: ' + error };
  }
};


// ... keep existing imports and functions ...

// 4. UPDATE USER PROFILE
export const updateUser = async (id: number, fullName: string, email: string, newPassword?: string) => {
  try {
    if (!fullName || !email) {
      return { success: false, message: 'Name and Email are required' };
    }

    // If password is provided, hash it. If not, keep old password.
    if (newPassword && newPassword.length > 0) {
      const hashedPassword = await hashPassword(newPassword);
      runTransaction(
        'UPDATE users SET fullName = ?, email = ?, password = ? WHERE id = ?',
        [fullName, email, hashedPassword, id]
      );
    } else {
      // Update details WITHOUT changing password
      runTransaction(
        'UPDATE users SET fullName = ?, email = ? WHERE id = ?',
        [fullName, email, id]
      );
    }

    // Return the updated user object so we can update AsyncStorage
    const updatedUser = runQuery('SELECT * FROM users WHERE id = ?', [id]);
    return { success: true, user: updatedUser[0] };

  } catch (error) {
    return { success: false, message: 'Database error: ' + error };
  }
};