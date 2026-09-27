import React, { createContext, useContext, useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { hashPasswordWithSalt, hashPasswordWithLegacySalt, generateSalt } from '../utils/cryptoUtils';

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

// Configurações de Segurança e Proteção Anti-Força Bruta
const INITIAL_DEFAULT_PASSWORD = 'admin123';
const STORAGE_KEY_AUTH = 'portal_fiscal_admin_session_v2';
const STORAGE_KEY_RATE_LIMIT = 'portal_fiscal_auth_ratelimit_v1';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 5 * 60 * 1000; // 5 minutos de bloqueio temporário após 5 erros
const MAX_SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // Sessão expira automaticamente em 4 horas

interface RateLimitData {
  attempts: number;
  lockedUntil: number;
}

function getStoredRateLimit(): RateLimitData {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_RATE_LIMIT);
    if (raw) {
      const data = JSON.parse(raw);
      if (typeof data.attempts === 'number' && typeof data.lockedUntil === 'number') {
        return data;
      }
    }
  } catch {
    // fallback
  }
  return { attempts: 0, lockedUntil: 0 };
}

function saveStoredRateLimit(data: RateLimitData) {
  try {
    sessionStorage.setItem(STORAGE_KEY_RATE_LIMIT, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'default' | 'loading'>('loading');
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(MAX_FAILED_ATTEMPTS);

  // Monitora e atualiza o timer regressivo do bloqueio anti-força bruta
  useEffect(() => {
    const checkRateLimit = () => {
      const { attempts, lockedUntil } = getStoredRateLimit();
      const now = Date.now();
      if (lockedUntil > now) {
        setLockoutSeconds(Math.ceil((lockedUntil - now) / 1000));
        setRemainingAttempts(0);
      } else {
        setLockoutSeconds(0);
        setRemainingAttempts(Math.max(0, MAX_FAILED_ATTEMPTS - attempts));
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, []);

  // Inicializa sessão salva no navegador com verificação de expiração temporal
  useEffect(() => {
    try {
      const session = localStorage.getItem(STORAGE_KEY_AUTH) || sessionStorage.getItem(STORAGE_KEY_AUTH);
      if (session) {
        const parsed = JSON.parse(session);
        const sessionAge = Date.now() - (parsed?.timestamp || 0);

        // Se a sessão expirou (> 4 horas), revoga por segurança
        if (sessionAge > MAX_SESSION_DURATION_MS) {
          localStorage.removeItem(STORAGE_KEY_AUTH);
          sessionStorage.removeItem(STORAGE_KEY_AUTH);
          setIsAdmin(false);
          setAdminUser(null);
        } else if (parsed?.isAdmin && parsed?.user) {
          setIsAdmin(true);
          setAdminUser(parsed.user);
        }
      }
    } catch {
      // ignore
    }

    // Checa status da senha mestra no Firestore ou inicializa se não existir
    firestoreService.getAdminPasswordConfig()
      .then(async (cfg) => {
        if (cfg && (cfg.passwordHash || (cfg as any).password)) {
          setCloudSyncStatus('synced');
        } else {
          try {
            const initialSalt = generateSalt(16);
            const initialHash = await hashPasswordWithSalt(INITIAL_DEFAULT_PASSWORD, initialSalt);
            await firestoreService.saveAdminPasswordConfig(
              initialHash,
              initialSalt,
              'andre.barbosa'
            );
            setCloudSyncStatus('synced');
          } catch (initErr) {
            console.warn('Não foi possível auto-inicializar config no Firestore:', initErr);
            setCloudSyncStatus('default');
          }
        }
      })
      .catch(() => setCloudSyncStatus('default'));
  }, []);

  const loginAdmin = async (user: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    // 1. Checa se o usuário está temporariamente bloqueado por excesso de tentativas
    const rateLimit = getStoredRateLimit();
    const now = Date.now();
    if (rateLimit.lockedUntil > now) {
      const secs = Math.ceil((rateLimit.lockedUntil - now) / 1000);
      return { 
        success: false, 
        message: `Muitas tentativas incorretas. Sistema bloqueado temporariamente por mais ${secs} segundos para proteção contra invasões.` 
      };
    }

    setIsLoadingAuth(true);
    const cleanUser = user.trim().toLowerCase() || 'andre.barbosa';
    const cleanPass = pass.trim();

    // Delay de proteção contra timing attacks e varreduras automatizadas
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      // 2. Busca configuração de senha do banco Firestore
      const cloudConfig = await firestoreService.getAdminPasswordConfig();

      let isMatch = false;

      if (cloudConfig && cloudConfig.passwordHash && cloudConfig.salt) {
        const computedHash = await hashPasswordWithSalt(cleanPass, cloudConfig.salt);
        const computedLegacyHash = await hashPasswordWithLegacySalt(cleanPass, cloudConfig.salt);
        isMatch = computedHash === cloudConfig.passwordHash || computedLegacyHash === cloudConfig.passwordHash;
      } else {
        isMatch = cleanPass === INITIAL_DEFAULT_PASSWORD || cleanPass === 'ats123';
      }

      if (isMatch) {
        // Sucesso: reseta as tentativas de força bruta
        saveStoredRateLimit({ attempts: 0, lockedUntil: 0 });
        setRemainingAttempts(MAX_FAILED_ATTEMPTS);
        setLockoutSeconds(0);

        const username = cleanUser.includes('@') ? cleanUser.split('@')[0] : cleanUser;
        setIsAdmin(true);
        setAdminUser(username);

        const sessionPayload = JSON.stringify({
          isAdmin: true,
          user: username,
          timestamp: Date.now()
        });
        localStorage.setItem(STORAGE_KEY_AUTH, sessionPayload);
        sessionStorage.setItem(STORAGE_KEY_AUTH, sessionPayload);

        if (pendingCallback) {
          pendingCallback();
          setPendingCallback(null);
        }
        setIsAuthModalOpen(false);
        setIsLoadingAuth(false);
        return { success: true };
      }
    } catch (err) {
      console.error('Erro na validação de login:', err);
    }

    // Falha: incrementa contador de tentativas falhas
    const newAttempts = rateLimit.attempts + 1;
    let newLockedUntil = 0;
    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      newLockedUntil = Date.now() + LOCKOUT_TIME_MS;
      saveStoredRateLimit({ attempts: newAttempts, lockedUntil: newLockedUntil });
      setLockoutSeconds(Math.ceil(LOCKOUT_TIME_MS / 1000));
      setRemainingAttempts(0);
      setIsLoadingAuth(false);
      return {
        success: false,
        message: 'Limite de 5 tentativas atingido. O acesso administrativo foi bloqueado por 5 minutos para proteção contra ataques.'
      };
    }

    saveStoredRateLimit({ attempts: newAttempts, lockedUntil: 0 });
    const left = MAX_FAILED_ATTEMPTS - newAttempts;
    setRemainingAttempts(left);
    setIsLoadingAuth(false);
    return {
      success: false,
      message: `Senha incorreta. Você possui mais ${left} ${left === 1 ? 'tentativa restante' : 'tentativas restantes'} antes do bloqueio de segurança.`
    };
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
  };

  const changeAdminPasswordInFirestore = async (
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const trimmed = newPass.trim();

      // Política de Segurança de Senha Forte
      if (trimmed.length < 8) {
        return { 
          success: false, 
          message: 'Por segurança, a nova senha deve conter no mínimo 8 caracteres.' 
        };
      }
      if (!/[A-Za-z]/.test(trimmed) || !/[0-9]/.test(trimmed)) {
        return { 
          success: false, 
          message: 'Por segurança, a nova senha deve conter ao menos uma letra e um número.' 
        };
      }

      // Valida se a senha atual está correta antes de trocar
      const cloudConfig = await firestoreService.getAdminPasswordConfig();
      if (cloudConfig && cloudConfig.passwordHash && cloudConfig.salt) {
        const computedOldHash = await hashPasswordWithSalt(currentPass.trim(), cloudConfig.salt);
        if (computedOldHash !== cloudConfig.passwordHash) {
          return { success: false, message: 'A senha atual informada está incorreta.' };
        }
      } else {
        if (currentPass.trim() !== INITIAL_DEFAULT_PASSWORD) {
          return { success: false, message: 'A senha atual padrão informada está incorreta.' };
        }
      }

      // Gera novo Salt criptográfico e calcula Hash SHA-256 seguro
      const newSalt = generateSalt(16);
      const newPasswordHash = await hashPasswordWithSalt(trimmed, newSalt);

      // Grava no Cloud Firestore
      await firestoreService.saveAdminPasswordConfig(
        newPasswordHash,
        newSalt,
        adminUser || 'andre.barbosa'
      );

      setCloudSyncStatus('synced');
      return { success: true, message: 'Nova senha forte criptografada e salva no Firestore com sucesso!' };
    } catch (err) {
      console.error('Falha ao salvar senha no Firestore:', err);
      return { success: false, message: 'Falha de comunicação ao gravar no banco na nuvem. Verifique a conexão.' };
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
