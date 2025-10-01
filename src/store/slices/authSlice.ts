import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  username: string;
  phone: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Load initial state from localStorage if available
const loadInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  try {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Error loading auth state:", error);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadInitialState();

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.login(credentials);
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    userData: {
      email: string;
      password: string;
      username: string;
      phone: string;
      role?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.register(userData);
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.logout();
      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
      }
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("auth_token", action.payload.token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Store user in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // Clear localStorage on login failure
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
        }
      })
      // Register cases
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Store user in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(registerUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // Clear localStorage on registration failure
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
        }
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // Clear localStorage on logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
        }
      });
  },
});

export const { clearAuth, setCredentials } = authSlice.actions;
export default authSlice.reducer;
