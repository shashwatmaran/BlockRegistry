import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const authAPI = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', {
            email: userData.email,
            username: userData.username || userData.email.split('@')[0],
            password: userData.password,
            full_name: userData.fullName,
            wallet_address: userData.walletAddress || null,
        });
        return response.data;
    },

    // Login user
    login: async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    // Get current user info
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Land API functions
export const landAPI = {
    // Register new land
    registerLand: async (landData, files) => {
        // Create FormData for file upload
        const formData = new FormData();

        // Add form fields
        formData.append('title', landData.title);
        formData.append('description', landData.description);
        formData.append('area', parseFloat(landData.area));
        formData.append('price', parseFloat(landData.price));
        formData.append('lat', landData.lat);
        formData.append('lng', landData.lng);
        formData.append('address', landData.address);

        // Add files
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await api.post('/land/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    // Get user's lands
    getMyLands: async () => {
        const response = await api.get('/land/my-lands');
        return response.data;
    },

    // Get land by ID
    getLandById: async (landId) => {
        const response = await api.get(`/land/${landId}`);
        return response.data;
    },
};

// User API functions
export const userAPI = {
    // Link wallet address to user account
    linkWallet: async (walletAddress, signature) => {
        const response = await api.post('/users/link-wallet', {
            wallet_address: walletAddress,
            signature: signature,
        });
        return response.data;
    },

    // Unlink wallet from user account
    unlinkWallet: async () => {
        const response = await api.post('/users/unlink-wallet');
        return response.data;
    },

    // Get wallet linking status
    getWalletStatus: async () => {
        const response = await api.get('/users/wallet-status');
        return response.data;
    },
};

// Verifier API functions
export const verifierAPI = {
    // Get all lands needing verifier action (not_minted + pending)
    getAllPendingLands: async () => {
        const response = await api.get('/land/all-pending');
        return response.data;
    },

    // Get only minted-but-unreviewed lands
    getPendingLands: async () => {
        const response = await api.get('/land/pending/list');
        return response.data;
    },

    // Get all verified lands
    getVerifiedLands: async () => {
        const response = await api.get('/land/verified/list');
        return response.data;
    },

    // Mint a land NFT on-chain (moves not_minted → pending)
    mintLand: async (landId) => {
        const response = await api.post(`/land/${landId}/mint`);
        return response.data;
    },

    // Verify a land (admin key used on backend, no private key needed)
    verifyLand: async (landId) => {
        const response = await api.post(`/land/${landId}/verify`, {});
        return response.data;
    },

    // Reject a land (reason only, no private key needed)
    rejectLand: async (landId, reason) => {
        const response = await api.post(`/land/${landId}/reject`, {
            reason: reason,
        });
        return response.data;
    },
};

// Admin API functions (admin role only)
export const adminAPI = {
    // List all users
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    // Update a user's role
    updateUserRole: async (userId, role) => {
        const response = await api.patch(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    // Set a user's public wallet address (for verifiers/admins)
    setUserWallet: async (userId, walletAddress) => {
        const response = await api.patch(`/admin/users/${userId}/wallet`, {
            wallet_address: walletAddress || null,
        });
        return response.data;
    },
};

export default api;
