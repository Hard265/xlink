import { useSQLiteContext } from 'expo-sqlite/next';
import React from 'react';

import { useStorageState } from './useStorageState';
import { BaseUser } from '../store/store';

const AuthContext = React.createContext<{
  signIn: (user: BaseUser) => void;
  signOut: () => void;
  session?: BaseUser | null;
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

  const onsignin = (user: BaseUser) => {
    db.runSync('INSERT INTO users (address, displayName, publicKey) VALUES (?, ?, ?)', [
      user.address,
      user.displayName,
      user.publicKey,
    ]);
    setSession(user.toJson());
  };

  const onsignout = () => {
    db.runSync('DELETE FROM users; DELETE FROM messages; VACUUM;');
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: onsignin,
        signOut: onsignout,
        session: session ? BaseUser.fromJson(JSON.parse(session)) : null,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
