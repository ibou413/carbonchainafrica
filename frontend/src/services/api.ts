// src/services/api.ts

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Handles login by sending credentials to the backend API.
 * @param username The user's username.
 * @param password The user's password.
 * @returns The JSON response from the server, containing user data and tokens.
 */
async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/users/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail || Object.values(data).join(' ');
    throw new Error(errorMessage || 'Login failed');
  }

  return data;
}

// You can add other API functions here, e.g., register, fetchProfile, etc.

export const apiService = {
  login,
};
