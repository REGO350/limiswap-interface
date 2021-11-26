import React from "react";
import * as popupActions from "../../state/popup/actions";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { selectPopup } from "../../state";
import { Alert } from "react-bootstrap";
import styles from "./Popup.module.css";
import { Backdrop } from "@mui/material";

const AlertModal = (): JSX.Element => {
  const {
    alert: { title, message, active },
  } = useSelector(selectPopup);
  const { setAlertModal } = bindActionCreators(popupActions, useDispatch());

  const onClickClose = () => {
    setAlertModal({
      active: false,
      title: "",
      message: "",
    })
  }

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={active}
      onClick={onClickClose}
      className={styles.popupBackdrop}
    >
      <Alert
        variant='danger'
        show={active}
        onClose={onClickClose}
        className={styles.popupContainer}
        dismissible
      >
        <Alert.Heading>{title}</Alert.Heading>
        <div>{message}</div>
      </Alert>
    </Backdrop>
  );
};

export default AlertModal;
