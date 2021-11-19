import { BigNumber } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import { getQuoterInstance, getTokenInstance } from "../contracts";
import { toBN } from "../utils";

export const getPrice = async (
  tokenIn_: string,
  tokenOut_: string,
): Promise<BigNumber> => {
  const quoter = await getQuoterInstance();
  const tokenIn = await getTokenInstance(tokenIn_);
  const tokenOut = await getTokenInstance(tokenOut_);
  const amoutIn = toBN(10).pow(await tokenIn.decimals());
  const amountOut = await quoter.callStatic.quoteExactInputSingle(
    tokenIn.address,
    tokenOut.address,
    3000,
    amoutIn,
    0,
  );
  return amountOut;
};

export const createOrder = async (
  price: number,
  amountIn: number,
  tokenIn: string,
  tokenOut: string,
  fee: number,
  slippage: number,
  signer: JsonRpcSigner
): Promise<string> => {

  return "";
}