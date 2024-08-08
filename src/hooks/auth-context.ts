import { createContext } from "react";

export const AuthContext = createContext({
  isLogged: false,
  login: () => {},
  logout: () => {},
});

export default AuthContext;