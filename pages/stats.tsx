import React from 'react'
import Head from "next/head";
import styles from "../styles/Stats.module.css";
import AlertModal from '../src/components/popups/AlertModal';
import SuccessModal from '../src/components/popups/SuccessModal';
import StatsInterface from '../src/components/stats/StatsInterface';

const stats = () => {
  return (
    <>
      <Head>
        <title>LimiSwap | Orders</title>
        <meta name="description" content="World leading token exchange!" />
        <link rel="icon§" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <AlertModal/>
        <SuccessModal/>
        <StatsInterface />
      </main>
    </>
  )
}

export default stats
