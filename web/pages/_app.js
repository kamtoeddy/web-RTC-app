import "../styles/globals.css";

import Head from "next/head";
import Layout from "../components/Layout";

import AuthContextProvider from "../contexts/AuthContext";
import CallContextProvider from "../contexts/CallContext";
import ThemeContextProvider from "../contexts/ThemeContext";
import SocketContextProvider from "../contexts/SocketContext";
import BroadcastContextProvider from "../contexts/BroadcastContext";
import SoundContextProvider from "../contexts/SoundContext";

function MyApp({ Component, pageProps }) {
  return (
    <SoundContextProvider>
      <AuthContextProvider>
        <SocketContextProvider>
          <BroadcastContextProvider>
            <CallContextProvider>
              <ThemeContextProvider>
                <Layout>
                  <Head>
                    <title>WebRTC Call App</title>
                  </Head>
                  <Component {...pageProps} />
                </Layout>
              </ThemeContextProvider>
            </CallContextProvider>
          </BroadcastContextProvider>
        </SocketContextProvider>
      </AuthContextProvider>
    </SoundContextProvider>
  );
}

export default MyApp;
