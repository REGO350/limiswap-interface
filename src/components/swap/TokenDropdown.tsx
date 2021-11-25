import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  Button,
  Dropdown,
  FormControl,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { isListedToken, listedTokens } from "../../contracts";
import styles from "./TokenDropdown.module.css";
import Image from "next/image";
import { isValidAddress } from "../../utils";

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
      require(`../../../public/${token.toLowerCase()}.png`);
      imgUrl = `/${token.toLowerCase()}.png`;
    } catch {
      imgUrl = "/no-img.png";
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

interface ICustomTokenModal {
  showSetting: boolean;
  setShowSettings: (value: boolean) => void;
  setCustomToken: (value: string) => void;
}

const CustomTokenModal: React.FC<ICustomTokenModal> = ({
  showSetting,
  setShowSettings,
  setCustomToken,
}) => {
  const [currentInput, setCurrentInput] = useState<string | undefined>(
    undefined
  );
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const innerRef = useRef<HTMLInputElement>(null);

  const onClickSave = () => {
    if (currentInput && isValidAddress(currentInput)) {
      setCustomToken(currentInput);
      setIsInvalid(false);
      setShowSettings(false);
    } else {
      setIsInvalid(true);
    }
  };

  const onClickClose = () => {
    setShowSettings(false);
    setIsInvalid(false);
  };

  useEffect(() => {
    if(innerRef && innerRef.current){
      innerRef.current.focus()
    }
  });

  return (
    <Modal
      show={showSetting}
      onHide={onClickClose}
      contentClassName={styles.contentModal}
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title className={styles.contentTitle}>
          Enter custom token address
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3" size="lg">
          <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
          <FormControl
            placeholder="Token address"
            aria-describedby="basic-addon1"
            onChange={(e) => setCurrentInput(e.target.value)}
            ref={innerRef}
          />
        </InputGroup>
        <div className={styles.subContent}>
          <h6>Note: Multi route is currently not supported</h6>
          {isInvalid && (
            <h5>
              <Badge bg="danger">Invalid address!</Badge>
            </h5>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className={styles.contentFooter}>
        <Button variant="secondary" onClick={onClickClose}>
          Close
        </Button>
        <Button variant="success" onClick={onClickSave}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
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
  const [showSetting, setShowSetting] = useState<boolean>(false);

  const handleSelect = (e: string | null): void => {
    if (e && isListedToken(e)) {
      setToken(e);
    } else {
      setShowSetting(true);
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
    <>
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
      <CustomTokenModal
        showSetting={showSetting}
        setShowSettings={setShowSetting}
        setCustomToken={setToken}
      />
    </>
  );
};
