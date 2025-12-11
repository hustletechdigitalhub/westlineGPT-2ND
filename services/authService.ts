
import { User, AuthProvider, Conversation } from '../types';

// Mock database in localStorage
const USERS_KEY = 'westlinegpt_users';
const SESSION_USER_KEY = 'westlinegpt_session_user';
const CONVERSATIONS_KEY_PREFIX = 'westlinegpt_convos_';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

const getMockUsers = (): User[] => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (e) {
        return [];
    }
};

const saveMockUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authService = {
    // Helper to check and reset usage limits
    checkAndResetUsage: (user: User): User => {
        if (user.isPremium) return user;

        const now = Date.now();
        // Initialize window if missing (migration for old users)
        const windowStart = user.usageWindowStart || now; 
        
        if (now - windowStart >= SIX_HOURS_MS) {
            // Reset window
            const updatedUser = {
                ...user,
                imageGenerationCount: 0,
                imageEditCount: 0,
                usageWindowStart: now
            };
            authService.updateUser(updatedUser);
            return updatedUser;
        }
        
        // Ensure fields exist for old users even if not resetting
        if (user.imageEditCount === undefined || user.usageWindowStart === undefined) {
             const updatedUser = {
                ...user,
                imageGenerationCount: user.imageGenerationCount || 0,
                imageEditCount: user.imageEditCount || 0,
                usageWindowStart: user.usageWindowStart || now
            };
            authService.updateUser(updatedUser);
            return updatedUser;
        }

        return user;
    },

    login: (email: string, password?: string): User | null => {
        const users = getMockUsers();
        let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            user = authService.checkAndResetUsage(user);
            sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    },

    signUp: (name: string, email: string, password?: string): User | null => {
        let users = getMockUsers();
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            return null; // User already exists
        }
        const newUser: User = {
            id: `user_${Date.now()}`,
            name,
            email,
            isPremium: false,
            imageGenerationCount: 0,
            imageEditCount: 0,
            usageWindowStart: Date.now(),
            profilePicture: null,
            theme: 'dark',
            preferences: { reduceMotion: false },
        };
        users.push(newUser);
        saveMockUsers(users);
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(newUser));
        return newUser;
    },

    signInWithProvider: (provider: AuthProvider, name: string, email: string): User => {
        let users = getMockUsers();
        let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
            if (user.name !== name) {
                user.name = name;
                saveMockUsers(users);
            }
            user = authService.checkAndResetUsage(user);
        } else {
            user = {
                id: `user_${Date.now()}`,
                name,
                email,
                isPremium: false,
                imageGenerationCount: 0,
                imageEditCount: 0,
                usageWindowStart: Date.now(),
                profilePicture: null,
                theme: 'dark',
                preferences: { reduceMotion: false },
            };
            users.push(user);
            saveMockUsers(users);
        }
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
        return user;
    },
    
    logout: () => {
        sessionStorage.removeItem(SESSION_USER_KEY);
    },

    getCurrentUser: (): User | null => {
        try {
            const userJson = sessionStorage.getItem(SESSION_USER_KEY);
            let user = userJson ? JSON.parse(userJson) : null;
            if (user) {
                user = authService.checkAndResetUsage(user);
            }
            return user;
        } catch (e) {
            return null;
        }
    },

    updateUser: (updatedUser: User) => {
        let users = getMockUsers();
        const userIndex = users.findIndex(u => u.id === updatedUser.id);
        if (userIndex > -1) {
            users[userIndex] = updatedUser;
            saveMockUsers(users);
            const currentUser = authService.getCurrentUser();
            // Only update session if it matches (prevent overwriting active session with stale data if handling multi-tab)
            // Ideally we check ID, but for this mock sync is fine.
            if (currentUser && currentUser.id === updatedUser.id) {
                sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updatedUser));
            }
        }
    },

    getConversationsForUser: (email: string): Conversation[] => {
        try {
            const convosJson = localStorage.getItem(`${CONVERSATIONS_KEY_PREFIX}${email}`);
            return convosJson ? JSON.parse(convosJson) : [];
        } catch (e) {
            return [];
        }
    },

    saveConversationsForUser: (email: string, conversations: Conversation[]) => {
        localStorage.setItem(`${CONVERSATIONS_KEY_PREFIX}${email}`, JSON.stringify(conversations));
    },
};
