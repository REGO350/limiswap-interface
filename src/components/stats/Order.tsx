import React, { useEffect, useState } from "react";
import * as swapActions from "../../state/swap/actions";
import * as userActions from "../../state/user/actions";
import * as popupActions from "../../state/popup/actions";
import { Badge, Card, Spinner } from "react-bootstrap";
import { IRawOrder } from "./StatsInterface";
import styles from "./Stats.module.css";
import { BigNumber } from "ethers";
import { fromWei, toBN } from "../../utils";
import { cancelOrder } from "../../interactions/limiswap";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../state";
import { bindActionCreators } from "redux";

interface IProps {
  key: string;
  rawOrder: IRawOrder;
}

const Order: React.FC<IProps> = ({ rawOrder }) => {
  const { signer } = useSelector(selectUser);
  const { setTxHash, setAlertModal, setSuccessModal } = bindActionCreators(
    { ...swapActions, ...userActions, ...popupActions },
    useDispatch()
  );

  const [loading, setLoading] = useState(false);
  const [isHovering, setHover] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("PENDING");

  const {
    tokenInSymbol,
    tokenOutSymbol,
    tokenInDecimals,
    tokenOutDecimals,
    targetPrice,
    amountIn,
    slippage,
    orderId,
    status,
  } = rawOrder;

  const onClickCancel = async () => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      const txHash = await cancelOrder(orderId, signer);
      setTxHash(txHash);
      setSuccessModal({
        active: true,
        txHash,
        message: "Approve Successful",
      });
      setCurrentStatus("CANCELLED");
    } catch (error: any) {
      setAlertModal({
        active: true,
        title: "Transaction Error!",
        message: error.message,
      });
    } finally {
      setLoading(false);
      setHover(false);
    }
  };

  useEffect(() => {
    setCurrentStatus(status);
  }, [status])

  const priceNum = fromWei(
    BigNumber.from(targetPrice),
    Number(tokenInDecimals)
  );
  const priceText =
    priceNum > 1 ? priceNum.toLocaleString() : Number(priceNum.toFixed(6));

  const amountInNum = fromWei(
    BigNumber.from(amountIn),
    Number(tokenInDecimals)
  );
  const amountInText =
    amountInNum > 1
      ? amountInNum.toLocaleString()
      : Number(amountInNum.toFixed(6));

  const amountOutNum = fromWei(
    BigNumber.from(targetPrice)
      .mul(BigNumber.from(amountIn))
      .div(toBN(10).pow(tokenInDecimals)),
    Number(tokenOutDecimals)
  );
  const amountOutText =
    amountOutNum > 0
      ? amountOutNum.toLocaleString()
      : Number(amountOutNum.toFixed(6));

  const slippageText = (Number(slippage) / 100).toString();

  return (
    <Card className={styles.card}>
      <Card.Body className={styles.cardBody}>
        <div className={styles.statusBox}>
          {currentStatus === "PENDING" ? (
            <Badge
              pill
              bg={isHovering ? "danger" : "secondary"}
              className={`${styles.statusText} ${styles.cancelText}`}
              onClick={onClickCancel}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              {loading ? (
                <Spinner
                  size="sm"
                  as="span"
                  animation="border"
                  role="status"
                  aria-hidden="true"
                />
              ) : isHovering ? (
                "Cancel"
              ) : (
                "Pending"
              )}
            </Badge>
          ) : currentStatus === "FILLED" ? (
            <Badge pill bg="success" className={styles.statusText}>
              Filled
            </Badge>
          ) : (
            <Badge pill bg="danger" className={styles.statusText}>
              Cancelled
            </Badge>
          )}
        </div>
        <Card.Title className={styles.cardTitleBox}>
          <div className={styles.pairNames}>
            {tokenInSymbol} → {tokenOutSymbol}
          </div>
          <div className={styles.priceTag}>
            @ {priceText} {tokenInSymbol} / {tokenOutSymbol}
          </div>
        </Card.Title>
        <Card.Text className={styles.cardText} as="div">
          <div className={styles.tokenIn}>
            <span>Amount in: </span>
            <span>
              {amountInText} {tokenInSymbol}
            </span>
          </div>
          <div className={styles.tokenOut}>
            <span>Amount out: </span>
            <span>
              {amountOutText} {tokenOutSymbol}{" "}
            </span>
          </div>
          <div className={styles.slippage}>
            <span>Max slippage: </span>
            <span>{slippageText}% </span>
          </div>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Order;
