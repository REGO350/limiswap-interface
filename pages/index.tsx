import Head from "next/head";
import SwapInterface from "../src/components/swap/SwapInterface";
import styles from "../styles/Home.module.css";
import AlertModal from "../src/components/popups/AlertModal";
import SuccessModal from "../src/components/popups/SuccessModal";

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>LimiSwap</title>
        <meta name="description" content="World leading token exchange!" />
        <link rel="icon§" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <AlertModal/>
        <SuccessModal/>
        <SwapInterface />
      </main>
    </>
  );
};

export default Home;
