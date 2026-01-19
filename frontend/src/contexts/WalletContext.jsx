import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

// Create Wallet Context
const WalletContext = createContext({
    walletAddress: null,
    isConnected: false,
    chainId: null,
    isCorrectNetwork: false,
    loading: false,
    error: null,
    connectWallet: async () => { },
    disconnectWallet: () => { },
    linkWalletToAccount: async () => { },
    switchNetwork: async () => { },
    getProvider: () => null,
    getSigner: async () => null,
});

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Target network from environment variables
    const targetChainId = process.env.REACT_APP_CHAIN_ID || '11155111'; // Sepolia by default
    const targetChainName = process.env.REACT_APP_CHAIN_NAME || 'Sepolia';

    const isConnected = !!walletAddress;
    const isCorrectNetwork = chainId === `0x${parseInt(targetChainId).toString(16)}`;

    // Check if MetaMask is installed
    const isMetaMaskInstalled = () => {
        return typeof window !== 'undefined' && window.ethereum?.isMetaMask;
    };

    // Get provider
    const getProvider = useCallback(() => {
        if (!isMetaMaskInstalled()) return null;
        return new BrowserProvider(window.ethereum);
    }, []);

    // Get signer
    const getSigner = useCallback(async () => {
        const provider = getProvider();
        if (!provider) return null;
        return await provider.getSigner();
    }, [getProvider]);

    // Connect wallet
    const connectWallet = async () => {
        setLoading(true);
        setError(null);

        try {
            // Check if MetaMask is installed
            if (!isMetaMaskInstalled()) {
                throw new Error(
                    'MetaMask is not installed. Please install MetaMask extension from metamask.io'
                );
            }

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found. Please create an account in MetaMask.');
            }

            // Get chain ID
            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId',
            });

            setWalletAddress(accounts[0]);
            setChainId(currentChainId);

            // Store connection preference
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', accounts[0]);

            return { success: true, address: accounts[0] };
        } catch (err) {
            console.error('Wallet connection error:', err);
            let errorMessage = 'Failed to connect wallet';

            if (err.code === 4001) {
                errorMessage = 'Connection request rejected. Please approve the connection in MetaMask.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Disconnect wallet
    const disconnectWallet = () => {
        setWalletAddress(null);
        setChainId(null);
        setError(null);
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
    };

    // Link wallet to user account
    const linkWalletToAccount = async (userEmail) => {
        if (!walletAddress) {
            return { success: false, error: 'No wallet connected' };
        }

        try {
            const signer = await getSigner();
            if (!signer) {
                return { success: false, error: 'Failed to get signer' };
            }

            // Create message to sign
            const message = `Link wallet ${walletAddress} to account ${userEmail}`;

            // Request user to sign message
            const signature = await signer.signMessage(message);

            // Import userAPI dynamically to avoid circular dependency
            const { userAPI } = await import('../services/api');

            // Send to backend
            await userAPI.linkWallet(walletAddress, signature);

            return { success: true };
        } catch (error) {
            console.error('Wallet linking failed:', error);
            let errorMessage = 'Failed to link wallet';

            if (error.code === 4001) {
                errorMessage = 'Signature request rejected';
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }

            return { success: false, error: errorMessage };
        }
    };

    // Switch to correct network
    const switchNetwork = async () => {
        if (!isMetaMaskInstalled()) {
            setError('MetaMask is not installed');
            return { success: false };
        }

        try {
            const targetChainIdHex = `0x${parseInt(targetChainId).toString(16)}`;

            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainIdHex }],
            });

            return { success: true };
        } catch (err) {
            console.error('Network switch error:', err);

            // If network doesn't exist, try to add it
            if (err.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: `0x${parseInt(targetChainId).toString(16)}`,
                                chainName: targetChainName,
                                rpcUrls: [process.env.REACT_APP_RPC_URL || 'https://rpc.sepolia.org'],
                                nativeCurrency: {
                                    name: 'Sepolia ETH',
                                    symbol: 'SepoliaETH',
                                    decimals: 18,
                                },
                                blockExplorerUrls: ['https://sepolia.etherscan.io'],
                            },
                        ],
                    });
                    return { success: true };
                } catch (addError) {
                    console.error('Failed to add network:', addError);
                    return { success: false, error: 'Failed to add network' };
                }
            }

            return { success: false, error: err.message };
        }
    };

    // Handle account changes
    useEffect(() => {
        if (!isMetaMaskInstalled()) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                // User disconnected all accounts
                disconnectWallet();
            } else if (accounts[0] !== walletAddress) {
                // User switched accounts
                setWalletAddress(accounts[0]);
                localStorage.setItem('walletAddress', accounts[0]);
            }
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, [walletAddress]);

    // Handle chain changes
    useEffect(() => {
        if (!isMetaMaskInstalled()) return;

        const handleChainChanged = (newChainId) => {
            setChainId(newChainId);
            // Reload page as recommended by MetaMask
            window.location.reload();
        };

        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }, []);

    // Auto-reconnect on mount if previously connected
    useEffect(() => {
        const wasConnected = localStorage.getItem('walletConnected');

        if (wasConnected === 'true' && isMetaMaskInstalled()) {
            // Silently reconnect
            window.ethereum
                .request({ method: 'eth_accounts' })
                .then((accounts) => {
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        // Get current chain ID
                        window.ethereum
                            .request({ method: 'eth_chainId' })
                            .then((currentChainId) => {
                                setChainId(currentChainId);
                            });
                    } else {
                        // No accounts available, clear storage
                        localStorage.removeItem('walletConnected');
                        localStorage.removeItem('walletAddress');
                    }
                })
                .catch((err) => {
                    console.error('Auto-reconnect failed:', err);
                    localStorage.removeItem('walletConnected');
                    localStorage.removeItem('walletAddress');
                });
        }
    }, []);

    const contextValue = {
        walletAddress,
        isConnected,
        chainId,
        isCorrectNetwork,
        loading,
        error,
        connectWallet,
        disconnectWallet,
        linkWalletToAccount,
        switchNetwork,
        getProvider,
        getSigner,
        targetChainId,
        targetChainName,
    };

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};
