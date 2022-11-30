import React, { createContext, useContext } from "react";

// helper modules
import { faker } from "@faker-js/faker";

export type User = {
  id: string;
  name: string;
};

type AuthContextType = { user: User };

const user = { name: faker.name.firstName(), id: faker.datatype.uuid() };

const AuthContext = createContext<AuthContextType>({ user });

const AuthContextProvider: React.FC<React.ReactNode> = ({ children }: any) => {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuthCTX = () => useContext(AuthContext);
