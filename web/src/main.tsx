import { StrictMode, lazy } from "react";
import ReactDOM from "react-dom/client";
const App = lazy(() => import("./App"));

// context providers
const AuthContextProvider = lazy(() => import("./contexts/AuthContext"));
const CallContextProvider = lazy(() => import("./contexts/CallContext"));
const SocketContextProvider = lazy(() => import("./contexts/SocketContext"));
const SoundContextProvider = lazy(() => import("./contexts/SoundContext"));
const ThemeContextProvider = lazy(() => import("./contexts/ThemeContext"));

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <SoundContextProvider>
      <AuthContextProvider>
        <SocketContextProvider>
          <CallContextProvider>
            <ThemeContextProvider>
              <App />
            </ThemeContextProvider>
          </CallContextProvider>
        </SocketContextProvider>
      </AuthContextProvider>
    </SoundContextProvider>
  </StrictMode>
);
