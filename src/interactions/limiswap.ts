import { BigNumber } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import {
  getLimiSwapInstance,
} from "../contracts";
import { ITokenInfo } from "../state/swap/reducers";
import { toWei } from "../utils";

export const createOrder = async (
  price: number,
  amountIn: BigNumber,
  tokenIn: ITokenInfo,
  tokenOut: ITokenInfo,
  fee: number,
  slippage: number,
  signer: JsonRpcSigner
): Promise<string> => {
  const limiswap = await getLimiSwapInstance(signer);
  const tx = await limiswap.createOrder(
    toWei(price, tokenIn.decimals),
    amountIn,
    tokenIn.address,
    tokenOut.address,
    fee,
    slippage,
    { gasLimit: 300_000 }
  );
  const { transactionHash } = await tx.wait();
  return transactionHash;
};

export const cancelOrder = async (
  orderId: string,
  signer: JsonRpcSigner
): Promise<string> => {
  const limiswap = await getLimiSwapInstance(signer);
  const tx = await limiswap.cancelOrder(orderId, { gasLimit: 150_000 });
  const { transactionHash } = await tx.wait();
  return transactionHash;
};
