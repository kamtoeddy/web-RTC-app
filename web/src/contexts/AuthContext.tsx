import { createContext, useContext } from 'react';

import { faker } from '@faker-js/faker';

export type User = {
  id: string;
  name: string;
};

type AuthContextType = { user: User };

const user = { name: faker.person.firstName(), id: faker.string.uuid() };

const AuthContext = createContext<AuthContextType>({ user });

const AuthContextProvider = ({ children }: any) => {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuthCTX = () => useContext(AuthContext);
