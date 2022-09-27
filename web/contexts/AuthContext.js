import { createContext, useState } from "react";

// helper modules
import { v4 as uuidv4 } from "uuid";
import faker from "faker";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [user] = useState({ name: faker.name.firstName(), _id: uuidv4() });

  const context = { user };

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
