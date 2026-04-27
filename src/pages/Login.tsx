import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { HardHat, Mail, Lock, Loader2, Chrome, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      if (isRegistering) {
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Send verification email
        await sendEmailVerification(userCredential.user);
        setMessage('Um e-mail de verificação foi enviado. Por favor, verifique sua caixa de entrada antes de prosseguir.');

        // Create profile
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          nome: email.split('@')[0],
          email: email,
          role: 'user', 
          ativo: true,
          criadoEm: serverTimestamp()
        });
        
        // Wait a bit then switch to login mode instead of navigating
        setTimeout(() => {
          setIsRegistering(false);
          setLoading(false);
        }, 3000);
        return;
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setError('Seu e-mail ainda não foi verificado. Por favor, verifique seu e-mail para acessar todas as funcionalidades.');
          // Don't navigate if not verified, or allow navigation but rules will block writes
          // navigate('/'); 
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso. Se você já tem uma conta, tente fazer login.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O cadastro com e-mail/senha não está habilitado no Console do Firebase. Ative-o em Authentication > Sign-in method.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha é muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setError('Falha na autenticação: ' + (err.message || 'Erro desconhecido'));
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const res = await getDoc(doc(db, 'users', user.uid));
      if (!res.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          nome: user.displayName || 'Sem nome',
          email: user.email,
          role: 'user',
          ativo: true,
          criadoEm: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err) {
      setError('Falha no login com Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <HardHat className="text-white w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">ObraControl</h1>
            <p className="text-neutral-500 text-sm mt-1">Gestão inteligente para sua obra</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 border border-green-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {message}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? 'Cadastrar' : 'Entrar')}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <div className="flex-1 h-px bg-neutral-200" />
            ou
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 w-full bg-white border border-neutral-200 text-neutral-700 font-medium py-2.5 rounded-lg hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Chrome className="w-5 h-5 text-red-500" />
            Acessar com Google
          </button>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              {isRegistering ? 'Já possui uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
