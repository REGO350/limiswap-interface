import React from "react";
import Link from "next/link";
import * as popupActions from "../../state/popup/actions";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { selectPopup } from "../../state";
import { Alert } from "react-bootstrap";
import { GoLinkExternal } from "react-icons/go";
import styles from "./Popup.module.css";
import { Backdrop } from "@mui/material";

const SuccessModal = (): JSX.Element => {
  const {
    success: { txHash, message, active },
  } = useSelector(selectPopup);
  const { setSuccessModal } = bindActionCreators(popupActions, useDispatch());

  const onClickClose = () => {
    setSuccessModal({
      active: false,
      txHash: txHash, 
      message: "",
    });
  };

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer - 1 }}
      open={active}
      onClick={onClickClose}
      className={styles.popupBackdrop} 
    >
      <Alert
        variant="success"
        show={active}
        onClose={onClickClose}
        className={styles.popupContainer}
        dismissible
      >
        <Alert.Heading>Transaction Confirmed!</Alert.Heading>
        <div>
          {message} <hr />
          <Link href={`https://kovan.etherscan.io/tx/${txHash}`}>
            <a target="_blank" rel="noreferrer">
              <GoLinkExternal size="20" />
              　View on EtherScan
            </a>
          </Link>
        </div>
      </Alert>
    </Backdrop>
  );
};

export default SuccessModal;
