import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import Layout from "../src/components/layout/Layout";
import store from "../src/state";
import { Provider } from "react-redux";
// import { SSRProvider } from "react-bootstrap";
import { SSRProvider } from "@react-aria/ssr";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      <Provider store={store}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </SSRProvider>
  );
}

export default MyApp;
