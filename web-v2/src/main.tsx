import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// context providers
import AuthContextProvider from "./contexts/AuthContext";
import CallContextProvider from "./contexts/CallContext";
import SocketContextProvider from "./contexts/SocketContext";
import SoundContextProvider from "./contexts/SoundContext";
import ThemeContextProvider from "./contexts/ThemeContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
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
  </React.StrictMode>
);
