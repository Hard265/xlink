import { useSQLiteContext } from 'expo-sqlite/next';
import React from 'react';

import { useStorageState } from './useStorageState';
import store, { Admin } from '../store/store';

const AuthContext = React.createContext<{
  signIn: (user: Admin) => void;
  signOut: () => void;
  session?: Admin | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const db = useSQLiteContext();

  const onsignin = (user: Admin) => {
    db.runSync('INSERT OR IGNORE INTO users (address, publicKey) VALUES (?, ?)', [
      user.address,
      user.publicKey,
    ]);
    setSession(JSON.stringify(user));
  };

  const onsignout = () => {
    db.runSync('DELETE FROM users; DELETE FROM messages; VACUUM;');
    store.reset();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: onsignin,
        signOut: onsignout,
        session: session ? JSON.parse(session) : null,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
