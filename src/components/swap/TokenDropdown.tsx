import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { isListedToken, listedTokens } from "../../contracts";
import styles from "./SwapInterface.module.css";
import Image from "next/image";

const DefaultText: React.FC = () => {
  return (
    <>
      Select <br /> Token
    </>
  );
};

const TokenText: React.FC<{ token: string }> = ({ token }) => {
  let imgUrl: string | null = null;
  let text: string = "";

  if (listedTokens.includes(token as any)) {
    try {
      require(`../../../public/${token.toLowerCase()}.png`)
      imgUrl = `/${token.toLowerCase()}.png`;
    } catch {
      imgUrl = "/no-img.png"
    }
    text = `${token.toUpperCase()}`;
  } else {
    text = `${token.slice(0, 5)}..${token.slice(-3)}`;
  }
  return (
    <div className={styles.dropdownText}>
      {imgUrl && <Image src={imgUrl} alt="" width={30} height={30} />}
      {imgUrl && <>&nbsp;&nbsp;</>} {text}
    </div>
  );
};

interface ITokenDropDown {
  token: string | undefined;
  setToken: (token: string) => void;
}

export const TokenDropdown: React.FC<ITokenDropDown> = ({
  token,
  setToken,
}) => {
  const [dropdownBtnText, setDropdownText] = useState<JSX.Element>(
    <DefaultText />
  );

  const handleSelect = (e: string | null): void => {
    if (e && isListedToken(e)) {
      setToken(e);
    } else {
      const token = prompt("Enter token address");
      token && setToken(token);
    }
  };

  useEffect(() => {
    if (token) {
      setDropdownText(<TokenText token={token} />);
    } else {
      setDropdownText(<DefaultText />);
    }
  }, [token]);

  return (
    <Dropdown onSelect={handleSelect}>
      <Dropdown.Toggle
        variant="outline-secondary"
        className={styles.dropdownBtn}
        bsPrefix="p-0"
      >
        {dropdownBtnText}
      </Dropdown.Toggle>

      <Dropdown.Menu className={styles.dropdownMenu}>
        {listedTokens.map((token) => (
          <Dropdown.Item
            eventKey={token}
            key={token}
            className={styles.dropdownItem}
          >
            <TokenText token={token} />
          </Dropdown.Item>
        ))}
        <Dropdown.Item
          eventKey="CUSTOM"
          key="CUSTOM"
          className={styles.dropdownItem}
        >
          <div className={styles.dropdownText}>&nbsp;&nbsp;CUSTOM</div>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
