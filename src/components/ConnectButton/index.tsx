import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { useAsync } from "../../hooks";
import {
  connectWallet,
  disconnectWallet,
} from "../../interactions/connectwallet";
import { selectUser } from "../../state";
import * as userActions from "../../state/user/actions";
import * as popupActions from "../../state/popup/actions";

const ConnectButton = () => {
  const { address, host } = useSelector(selectUser);
  const { updateProvider, updateUserInfo, setTxHash, setAlertModal } = bindActionCreators(
    {...userActions, ...popupActions},
    useDispatch()
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [isHovering, setHover] = useState<boolean>(false);

  const onClickConnect = async () => {
    try {
      setLoading(true);
      const { host, provider, signer, address } = await connectWallet();
      updateProvider({ host, provider });
      updateUserInfo({ signer, address });
    } catch (error: any) {
      setAlertModal({
        active: true,
        title: "Connection Error!",
        message: error.message || "Refused to connect",
      });
    } finally {
      setHover(false)
      setLoading(false);
    }
  };

  const onClickDisconnect = async () => {
    const data = await disconnectWallet(host);
    const { host: newHost, provider, signer, address, txHash } = data;
    updateProvider({ host: newHost, provider });
    updateUserInfo({ signer, address });
    setTxHash(txHash);
  };

  return (
    <>
      <Button
        variant="warning"
        onClick={!address ? onClickConnect : onClickDisconnect}
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={loading}
        size="lg"
        style={{ width: "160px" }}
      >
        {loading ? (
          <Spinner
            as="span"
            animation="border"
            role="status"
            aria-hidden="true"
          />
        ) : address ? (
          isHovering ? (
            "Disconnect"
          ) : (
            "Connected"
          )
        ) : (
          "Connet Wallet"
        )}
      </Button>
    </>
  );
};

export default ConnectButton;
