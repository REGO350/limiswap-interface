import Moralis from "moralis/types";
import React, { useEffect, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { useMoralisCloudFunction } from "react-moralis";
import { useSelector } from "react-redux";
import useAsyncEffect from "use-async-effect";
import { selectUser } from "../../state";
import Order from "./Order";
import styles from "./Stats.module.css";

export interface IRawOrder {
  orderId: number;
  targetPrice: string;
  amountIn: string;
  tokenIn: string;
  tokenOut: string;
  tokenInSymbol: string;
  tokenInDecimals: string;
  tokenOutSymbol: string;
  tokenOutDecimals: string;
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
    const rawData = data as Moralis.Object[];
    if (data && !error) {
      if (rawData.length > 0) {
        const rawOrders = rawData.map(item => item.attributes);
        setRawOrders(rawOrders as IRawOrder[]);
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
        <div className={styles.orderBoxHeader}>
          <div id={styles.positionsText}>Your orders ({rawOrders.length})</div>
          <div id={styles.statusText}>Status</div>
        </div>
        {rawOrders.map((rawOrder) => (
          <Order rawOrder={rawOrder} key={rawOrder.orderId.toString()} />
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
