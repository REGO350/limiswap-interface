import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import Layout from "../src/components/layout/Layout";
import store from "../src/state";
import { Provider } from "react-redux";
import { SSRProvider } from "react-bootstrap";
import { MoralisProvider } from "react-moralis";

function MyApp({ Component, pageProps }: AppProps) {
  const appId = process.env.NEXT_PUBLIC_APP_ID || "";
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";

  return (
    <SSRProvider>
      <Provider store={store}>
        <MoralisProvider appId={appId} serverUrl={serverUrl}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </MoralisProvider>
      </Provider>
    </SSRProvider>
  );
}

export default MyApp;
