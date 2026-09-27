import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  AlertCircle, 
  X, 
  KeyRound, 
  Settings2, 
  CheckCircle2, 
  Database,
  Loader2
} from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    loginAdmin, 
    changeAdminPasswordInFirestore, 
    cloudSyncStatus,
    isLoadingAuth,
    lockoutSeconds,
    remainingAttempts
  } = useAuth();

  const [username, setUsername] = useState('andre.barbosa');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modo de alteração de senha
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    setError(null);
    setSuccessMsg(null);

    const res = await loginAdmin(username, password);
    if (!res.success) {
      setError(res.message || 'Senha incorreta para o Administrador do Sistema.');
    } else {
      setPassword('');
      setError(null);
    }
  };

  const handleClose = () => {
    setError(null);
    setPassword('');
    setSuccessMsg(null);
    setIsChangingPass(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmNewPass('');
    setIsAuthModalOpen(false);
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPass !== confirmNewPass) {
      setError('A nova senha e a confirmação digitadas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    const res = await changeAdminPasswordInFirestore(currentPass, newPass);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg('Senha mestra salva e criptografada no banco de dados Firestore com sucesso!');
      setIsChangingPass(false);
      setPassword(newPass);
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] overflow-y-auto relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isChangingPass ? 'Definir Senha no Banco' : 'Acesso de Administrador'}</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Salvo e protegido no Cloud Firestore</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        <div className="px-6 pt-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Form: Alterar Senha no Banco */}
        {isChangingPass ? (
          <form onSubmit={handleSaveNewPassword} className="p-6 pt-3 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                A sua nova senha será criptografada com <strong>SHA-256 + Salt</strong> e gravada diretamente na coleção de segurança do banco Firebase Firestore. Requer no mínimo 8 caracteres, contendo letras e números.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha Atual
              </label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all"
                placeholder="Digite a senha atual"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nova Senha Forte (mínimo 8 dígitos)
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all"
                placeholder="Mínimo 8 caracteres (letras e números)"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Exemplo: Fiscal@2026 ou SenhaForte123
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all"
                placeholder="Repita a nova senha para confirmação"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setIsChangingPass(false); setError(null); }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
              >
                Voltar ao login
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Salvar no Banco</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Form: Login Padrão com Proteção Anti-Força Bruta */
          <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
            {lockoutSeconds > 0 ? (
              <div className="p-3 bg-red-100 border border-red-300 rounded-xl flex items-start gap-2.5 animate-pulse">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div className="text-xs text-red-950 font-bold leading-relaxed">
                  Bloqueio de segurança ativo (Anti-Brute Force). Aguarde <strong>{lockoutSeconds} segundos</strong> para tentar novamente.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  Apenas o administrador autorizado possui a chave de desbloqueio para edições fiscais.
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Usuário / Administrador
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={lockoutSeconds > 0}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all disabled:opacity-50"
                  placeholder="Ex: andre.barbosa"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Senha Mestra
                </label>
                <button
                  type="button"
                  onClick={() => { setIsChangingPass(true); setError(null); setSuccessMsg(null); }}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>Definir / Trocar Senha</span>
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={lockoutSeconds > 0}
                  autoFocus
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all disabled:opacity-50"
                  placeholder={lockoutSeconds > 0 ? 'Acesso temporariamente bloqueado' : 'Digite sua senha de administrador'}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                {cloudSyncStatus === 'synced' ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Protegido no banco Firestore</span>
                  </span>
                ) : (
                  <span>Acesso restrito a administradores autorizados</span>
                )}
                {remainingAttempts < 5 && lockoutSeconds === 0 && (
                  <span className="text-amber-700 font-bold">
                    {remainingAttempts} {remainingAttempts === 1 ? 'tentativa restante' : 'tentativas restantes'}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoadingAuth || lockoutSeconds > 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/20 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoadingAuth ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{lockoutSeconds > 0 ? `Bloqueado (${lockoutSeconds}s)` : 'Validar e Entrar'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
