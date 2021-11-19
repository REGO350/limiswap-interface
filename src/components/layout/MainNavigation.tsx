import React from "react";
import styles from "./MainNavigation.module.css";
import ConnectButton from "../ConnectButton";
import Link from "next/link";

const MainNavigation: React.FC = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>LimiSwap</h1>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link href="/">Swap</Link>
          </li>
          <li>
            <Link href="/stats">Stats</Link>
          </li>
        </ul>
      </nav>
      <div className={styles.button}>
        <ConnectButton />
      </div>
    </header>
  );
};

export default MainNavigation;
