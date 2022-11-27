import "../styles/globals.css";

import Head from "next/head";

import AuthContextProvider from "../contexts/AuthContext";
import CallContextProvider from "../contexts/CallContext";
import ThemeContextProvider from "../contexts/ThemeContext";
import SocketContextProvider from "../contexts/SocketContext";
import SoundContextProvider from "../contexts/SoundContext";

function MyApp({ Component, pageProps }) {
  return (
    <SoundContextProvider>
      <AuthContextProvider>
        <SocketContextProvider>
          <CallContextProvider>
            <ThemeContextProvider>
              <Head>
                <title>WebRTC Call App</title>
              </Head>
              <Component {...pageProps} />
            </ThemeContextProvider>
          </CallContextProvider>
        </SocketContextProvider>
      </AuthContextProvider>
    </SoundContextProvider>
  );
}

export default MyApp;
