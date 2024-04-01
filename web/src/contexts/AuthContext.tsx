import { ReactNode, createContext, useContext } from 'react';

import { faker } from '@faker-js/faker';

export type User = {
  id: string;
  name: string;
};

type AuthContextType = { user: User };

const user = { name: faker.person.firstName(), id: faker.string.uuid() };

const AuthContext = createContext<AuthContextType>({ user });
export const useAuthCTX = () => useContext(AuthContext);

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}
