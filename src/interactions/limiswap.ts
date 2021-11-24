import { BigNumber } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import { getQuoterInstance, getTokenInstance } from "../contracts";
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