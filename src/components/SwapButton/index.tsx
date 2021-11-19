import React from "react";
import { useSelector } from "react-redux";
import { selectSwap, selectUser } from "../../state";
import { Button, Spinner } from "react-bootstrap";
import styles from "./SwapButton.module.css";

interface IProps {
  loading: boolean;
  payable: boolean;
  approved: boolean;
  hasEntered: boolean;
}

const SwapButton: React.FC<IProps> = ({
  loading,
  payable,
  approved,
  hasEntered
}) => {
  const { address } = useSelector(selectUser);
  const { tokenIn, tokenOut } = useSelector(selectSwap);
  const tokenSelected = tokenIn && tokenOut;

  return (
    <Button
      variant="primary"
      type="submit"
      disabled={
        loading ||
        (address !== "" && !payable) ||
        (address !== "" && !hasEntered)
      }
      className={styles.btn}
    >
      {loading ? (
        <Spinner
          as="span"
          animation="border"
          role="status"
          aria-hidden="true"
        /> 
      ) : address ? (
        !hasEntered ? (
          "Enter an Amount"
        ) : payable ? (
          approved  ? (
            "Swap"
          ) : (
            "Approve token"
          )
        ) : tokenSelected ? (
          "Insufficient Balance"
        ) : (
          "Select a Token"
        )
      ) : (
        "Connet to a Wallet"
      )}
    </Button>
  );
};

export default SwapButton;
