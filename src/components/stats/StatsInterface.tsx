import React, { useEffect, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { useMoralisCloudFunction } from "react-moralis";
import { useSelector } from "react-redux";
import useAsyncEffect from "use-async-effect";
import { selectUser } from "../../state";
import Order from "./Order";
import styles from "./Stats.module.css";

export interface IRawOrder {
  orderId: string;
  targetPrice: string;
  amountIn: string;
  tokenIn: string;
  tokenOut: string;
  user: string;
  poolFee: string;
  slippage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  objectId: string;
}

const StatsInterface = () => {
  const { address } = useSelector(selectUser);
  const { data, error, isLoading, fetch } = useMoralisCloudFunction(
    "getOrders",
    {
      userAddr: address,
    },
    { autoFetch: false }
  );

  const [rawOrders, setRawOrders] = useState<IRawOrder[] | undefined | null>(
    undefined
  );

  useAsyncEffect(async () => {
    if (address) {
      await fetch();
    }
  }, [address]);

  useEffect(() => {
    if (data && !error) {
      //@ts-ignore
      if (data.length > 0) {
        setRawOrders(data as IRawOrder[]);
      } else {
        setRawOrders(null);
      }
    } else {
      setRawOrders(undefined);
    }
  }, [data, error]);

  return address ? (
    isLoading ? (
      <Spinner animation="border" />
    ) : rawOrders ? (
      <div className={styles.orderBox}>
        {rawOrders.map((rawOrder) => (
          <Order rawOrder={rawOrder} key={rawOrder.objectId} />
        ))}
      </div>
    ) : (
      <div>No tx</div>
    )
  ) : (
    <Alert variant="danger">Connect wallet to view your orders!</Alert>
  );
};

export default StatsInterface;
