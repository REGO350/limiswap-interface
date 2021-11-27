import { BigNumber } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import { getLimiSwapInstance, getQuoterInstance, getTokenInstance } from "../contracts";
import { toBN, toWei } from "../utils";
import { ITokenInfo } from "../state/swap/reducers";

export const createOrder = async (
  price: number,
  amountIn: BigNumber,
  tokenIn: ITokenInfo,
  tokenOut: ITokenInfo,
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
  const tx = await limiswap.cancelOrder(orderId, { gasLimit: 150_000 });
  const { transactionHash } = await tx.wait();
  return transactionHash;
}