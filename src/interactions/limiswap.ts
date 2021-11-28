import { BigNumber } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import { getLimiSwapInstance, getTokenAddr } from "../contracts";
import { ITokenInfo } from "../state/swap/reducers";
import { toBN, toWei } from "../utils";

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
  let value = toBN(0);
  if (tokenIn.address === getTokenAddr("ETH")) {
    value = amountIn;
  }
  const tx = await limiswap.createOrder(
    toWei(price, tokenIn.decimals),
    amountIn,
    tokenIn.address,
    tokenOut.address,
    fee,
    slippage * 100,
    {
      gasLimit: 300_000,
      value,
      maxFeePerGas: toWei(6, 9),
      maxPriorityFeePerGas: toWei(6, 9),
    }
  );
  const { transactionHash } = await tx.wait(1);
  return transactionHash;
};

export const cancelOrder = async (
  orderId: string,
  signer: JsonRpcSigner
): Promise<string> => {
  const limiswap = await getLimiSwapInstance(signer);
  const tx = await limiswap.cancelOrder(orderId, {
    gasLimit: 150_000,
    maxFeePerGas: toWei(6, 9),
    maxPriorityFeePerGas: toWei(6, 9),
  });
  const { transactionHash } = await tx.wait(1);
  return transactionHash;
};
