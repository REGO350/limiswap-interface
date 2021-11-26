import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  Button,
  Dropdown,
  FormControl,
  InputGroup,
  Modal,
  Spinner,
} from "react-bootstrap";
import { isListedToken, listedTokens } from "../../contracts";
import styles from "./TokenDropdown.module.css";
import Image from "next/image";
import { isValidAddress } from "../../utils";
import { getDecimals, getSymbol } from "../../interactions/token";

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
  } else if(isValidAddress(token)){
    text = `${token.slice(0, 5)}..${token.slice(-3)}`;
  } else {
    text = `${token.toUpperCase()}`;
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
  setTokenInfo: (tokenInfo: { symbol: string, decimals: number }) => void;
}

const CustomTokenModal: React.FC<ICustomTokenModal> = ({
  showSetting,
  setShowSettings,
  setCustomToken,
  setTokenInfo
}) => {
  const [currentInput, setCurrentInput] = useState<string | undefined>(
    undefined
  );
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const innerRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onClickSave = async () => {
    if (currentInput && isValidAddress(currentInput)) {
      try {
        setLoading(true);

        const symbol = await getSymbol(currentInput);
        const decimals = await getDecimals(currentInput);

        setCustomToken(currentInput);
        setTokenInfo({ symbol, decimals});
        setIsInvalid(false);
        setShowSettings(false);
      } catch {
        setIsInvalid(true);
      } finally {
        setLoading(false);
      }
    } else {
      setIsInvalid(true);
    }
  };

  const onClickClose = () => {
    setShowSettings(false);
    setIsInvalid(false);
  };

  const onInputChange = (
    e: React.ChangeEvent<typeof FormControl & HTMLInputElement>
  ) => {
    setCurrentInput(e.target.value);
    setIsInvalid(false);
  };

  useEffect(() => {
    if (innerRef && innerRef.current) {
      innerRef.current.focus();
    }
  });

  return (
    <Modal
      show={showSetting}
      onHide={onClickClose}
      contentClassName={styles.contentModal}
      animation={false}
      backdropClassName={styles.contentBackdrop}
    >
      <Modal.Header className={styles.contentHeader}>
        <Modal.Title className={styles.contentTitle}>
          Enter custom token address:
        </Modal.Title>
        {isInvalid && (
          <h5>
            <Badge bg="danger">Invalid address!</Badge>
          </h5>
        )}
      </Modal.Header>
      <Modal.Body className={styles.contentBody}>
        <InputGroup size="lg" className={styles.contentInputGroup}>
          <FormControl
            placeholder="0x ..."
            aria-describedby="basic-addon1"
            onChange={onInputChange}
            ref={innerRef}
            className={styles.contentFormControl}
          />
        </InputGroup>
        <div className={styles.subContent}>
          <h6>Note: Multi-route swap is currently not supported</h6>
        </div>
      </Modal.Body>
      <Modal.Footer className={styles.contentFooter}>
        <Button
          variant="secondary"
          onClick={onClickClose}
          className={styles.modalButton}
          id={styles.closeButton}
        >
          Close
        </Button>
        <Button
          variant="success"
          onClick={onClickSave}
          className={styles.modalButton}
          id={styles.confirmButton}
          disabled={loading}
        >
          {loading ? (
            <Spinner
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
              size="sm"
            />
          ) : (
            "Confirm"
          )}
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
  const [dropdownBtnText, setDropdownBtnText] = useState<JSX.Element>(
    <DefaultText />
  );
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const [customTokenSymbol, setCustomTokenSymbol] = useState<string | undefined>(undefined);

  const handleSelect = (e: string | null): void => {
    if (e && isListedToken(e)) {
      setToken(e);
      setCustomTokenSymbol(undefined);
    } else {
      setShowSetting(true);
    }
  };

  useEffect(() => {
    if (token) {
      if(customTokenSymbol){
        setDropdownBtnText(<TokenText token={customTokenSymbol} />);
      }else{
        setDropdownBtnText(<TokenText token={token} />);
      }
    } else {
      setDropdownBtnText(<DefaultText />);
    }
  }, [token, customTokenSymbol]);

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
        setTokenInfo={({ symbol }) => setCustomTokenSymbol(symbol)}
      />
    </>
  );
};
