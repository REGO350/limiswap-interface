import { BigNumber } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import { getLimiSwapInstance, getQuoterInstance, getTokenInstance } from "../contracts";
import { toBN } from "../utils";

export const createOrder = async (
  price: number,
  amountIn: number,
  tokenIn: string,
  tokenOut: string,
  fee: number,
  slippage: number,
  signer: JsonRpcSigner,
): Promise<string> => {
  
  return "";
}

export const cancelOrder = async (
  orderId: string,
  signer: JsonRpcSigner,
): Promise<string> => {
  const limiswap = await getLimiSwapInstance(signer);
  const tx = await limiswap.cancelOrder(orderId);
  const { transactionHash } = await tx.wait();
  return transactionHash;
}