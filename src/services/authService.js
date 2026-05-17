// ─────────────────────────────────────────────────────────────────
//  authService.js — Login, cadastro e logout via Firebase Auth
//
//  Padrão simples (igual ao outro projeto):
//    • Email/senha pelo Firebase Authentication
//    • Admin é definido por: ter um documento com o seu email como ID
//      na coleção `admins` do Firestore
//    • SEM custom claims, SEM terminal, SEM código no servidor
// ─────────────────────────────────────────────────────────────────

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase'
import { upsertUsuario } from './usuariosService'

/** Cadastrar nova conta. Campos extras (phone, birthday) já vão pro Firestore. */
export async function signUp(email, password, displayName = '', phone = '', birthday = '') {
  if (!auth) throw new Error('Firebase não configurado. Verifique as variáveis de ambiente.')
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    try { await updateProfile(cred.user, { displayName }) } catch {}
  }
  // Persiste dados completos no Firestore (também serve pra contas antigas que
  // estão completando o cadastro via Login com modo signup).
  try {
    await upsertUsuario({ name: displayName, email, phone, birthday })
  } catch {}
  return cred.user
}

/** Fazer login. */
export async function signIn(email, password) {
  if (!auth) throw new Error('Firebase não configurado. Verifique as variáveis de ambiente.')
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

/** Sair. */
export async function signOut() {
  if (!auth) return
  await firebaseSignOut(auth)
}

/** Observa mudanças de autenticação. Retorna unsubscribe. */
export function observeAuth(callback) {
  if (!auth) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

/** Mensagens de erro mais amigáveis. */
export function friendlyAuthError(err) {
  const code = err?.code || ''
  if (code.includes('user-not-found'))         return 'Usuária não encontrada. Verifique o e-mail.'
  if (code.includes('wrong-password'))         return 'Senha incorreta.'
  if (code.includes('invalid-credential'))     return 'E-mail ou senha incorretos.'
  if (code.includes('invalid-email'))          return 'E-mail inválido.'
  if (code.includes('email-already-in-use'))   return 'Este e-mail já tem cadastro. Faça login.'
  if (code.includes('weak-password'))          return 'Senha fraca — use ao menos 6 caracteres.'
  if (code.includes('too-many-requests'))      return 'Muitas tentativas. Tente novamente em alguns minutos.'
  if (code.includes('network-request-failed')) return 'Sem conexão. Verifique sua internet.'
  return err?.message || 'Erro desconhecido.'
}
