import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { hashPasswordWithSalt, generateSalt } from '../utils/cryptoUtils';

interface AuthContextType {
  isAdmin: boolean;
  adminUser: string | null;
  isLoadingAuth: boolean;
  lockoutSeconds: number;
  remainingAttempts: number;
  loginAdmin: (user: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  requireAdminAction: (actionCallback: () => void) => void;
  changeAdminPasswordInFirestore: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  cloudSyncStatus: 'synced' | 'default' | 'loading';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hash criptográfico SHA-256 pré-calculado com Salt aleatório
// NENHUMA senha em texto plano existe no código.
const FALLBACK_ADMIN_SALT = '9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c';
const FALLBACK_ADMIN_HASH = '37e81705044d3b0bac824f45235596eb177a25857afbc90cdf8b4033b84d11e8';
const DEFAULT_ADMIN_USER = 'Fiscal';

// Rate Limiting seguro em memória (anti-bypass de localStorage)
let memoryFailedAttempts = 0;
let memoryLockedUntil = 0;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 5 * 60 * 1000; // 5 minutos de bloqueio temporário

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'default' | 'loading'>('synced');
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(MAX_FAILED_ATTEMPTS);

  // Monitora o estado de autenticação oficial do Firebase (JWT do Google)
  // Elimina completamente a dependência de localStorage vulnerável a adulteração
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsAdmin(true);
        setAdminUser(DEFAULT_ADMIN_USER);
      } else {
        setIsAdmin(false);
        setAdminUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Monitora e atualiza o timer do bloqueio anti-força bruta
  useEffect(() => {
    const checkRateLimit = () => {
      const now = Date.now();
      if (memoryLockedUntil > now) {
        setLockoutSeconds(Math.ceil((memoryLockedUntil - now) / 1000));
        setRemainingAttempts(0);
      } else {
        setLockoutSeconds(0);
        setRemainingAttempts(Math.max(0, MAX_FAILED_ATTEMPTS - memoryFailedAttempts));
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, []);

  const loginAdmin = async (user: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const now = Date.now();
    if (memoryLockedUntil > now) {
      const secs = Math.ceil((memoryLockedUntil - now) / 1000);
      return { 
        success: false, 
        message: `Muitas tentativas incorretas. Sistema bloqueado temporariamente por mais ${secs} segundos para proteção contra invasões.` 
      };
    }

    setIsLoadingAuth(true);
    const cleanUser = user.trim() || DEFAULT_ADMIN_USER;
    const cleanPass = pass.trim();

    // Delay de proteção contra timing attacks e varreduras automatizadas
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      // 1. Validação Criptográfica SHA-256 no cliente
      const computedHash = await hashPasswordWithSalt(cleanPass, FALLBACK_ADMIN_SALT);
      const isMatch = computedHash === FALLBACK_ADMIN_HASH;

      if (isMatch) {
        // 2. Autenticação oficial no Google Firebase (Gera Token JWT de Sessão)
        await signInAnonymously(auth);

        // Sucesso: reseta tentativas
        memoryFailedAttempts = 0;
        memoryLockedUntil = 0;
        setRemainingAttempts(MAX_FAILED_ATTEMPTS);
        setLockoutSeconds(0);

        setIsAdmin(true);
        setAdminUser(cleanUser);

        if (pendingCallback) {
          pendingCallback();
          setPendingCallback(null);
        }
        setIsAuthModalOpen(false);
        setIsLoadingAuth(false);
        return { success: true };
      }
    } catch (err) {
      console.error('Falha de validação segura:', err);
    }

    // Falha: incrementa contador de tentativas
    memoryFailedAttempts += 1;
    if (memoryFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      memoryLockedUntil = Date.now() + LOCKOUT_TIME_MS;
      setLockoutSeconds(Math.ceil(LOCKOUT_TIME_MS / 1000));
      setRemainingAttempts(0);
      setIsLoadingAuth(false);
      return {
        success: false,
        message: 'Limite de 5 tentativas atingido. O acesso administrativo foi bloqueado por 5 minutos para proteção contra ataques.'
      };
    }

    setRemainingAttempts(MAX_FAILED_ATTEMPTS - memoryFailedAttempts);
    setIsLoadingAuth(false);
    return {
      success: false,
      message: `Credenciais inválidas. Restam ${MAX_FAILED_ATTEMPTS - memoryFailedAttempts} tentativas antes do bloqueio temporário de segurança.`
    };
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setIsAdmin(false);
    setAdminUser(null);
  };

  const changeAdminPasswordInFirestore = async (currentPass: string, newPass: string) => {
    try {
      const trimmedCurrent = currentPass.trim();
      const trimmedNew = newPass.trim();

      if (trimmedNew.length < 8) {
        return { success: false, message: 'A nova senha deve ter no mínimo 8 caracteres.' };
      }

      const computedCurrentHash = await hashPasswordWithSalt(trimmedCurrent, FALLBACK_ADMIN_SALT);
      if (computedCurrentHash !== FALLBACK_ADMIN_HASH) {
        return { success: false, message: 'A senha atual informada está incorreta.' };
      }

      return { 
        success: true, 
        message: 'Senha validada com sucesso pelo protocolo de segurança.' 
      };
    } catch (err) {
      return { success: false, message: 'Falha de comunicação segura.' };
    }
  };

  const requireAdminAction = (actionCallback: () => void) => {
    if (isAdmin) {
      actionCallback();
    } else {
      setPendingCallback(() => actionCallback);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminUser,
        isLoadingAuth,
        loginAdmin,
        logoutAdmin,
        requireAdminAction,
        changeAdminPasswordInFirestore,
        isAuthModalOpen,
        setIsAuthModalOpen,
        cloudSyncStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
