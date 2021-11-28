import { JsonRpcSigner } from "@ethersproject/providers";
import { MaxUint256 } from "@ethersproject/constants";
import { BigNumber } from "ethers";
import { getDefaultProvider } from "../connectors";
import { getTokenInstance, limiswapAddr } from "../contracts";
import { toWei } from "../utils";
import { ITokenInfo } from "../state/swap/reducers";

export const getDecimals = async (
  selectedToken: string
) => {
  const token = await getTokenInstance(selectedToken);
  const decimals = await token.decimals();
  return decimals;
}

export const getSymbol = async (
  selectedToken: string
) => {
  const token = await getTokenInstance(selectedToken);
  const symbol = await token.symbol();
  return symbol;
}

export const getBalanceAllownace = async (
  userAddr: string,
  selectedToken: ITokenInfo
): Promise<{ balance: BigNumber; allowance: BigNumber }> => {
  try {
    if (selectedToken.symbol === "ETH") {
      const provider = getDefaultProvider();
      const balance = await provider.getBalance(userAddr);
      return { balance, allowance: MaxUint256 };
    } else {
      const token = await getTokenInstance(selectedToken.address);
      const balance = await token.balanceOf(userAddr);
      const allowance = await token.allowance(userAddr, limiswapAddr);
      return { balance, allowance };
    }
  } catch (err) {
    throw err;
  }
};

export const getAllowance = async (
  userAddr: string,
  selectedToken: ITokenInfo
): Promise<{ allowance: BigNumber }> => {
  try {
    if (selectedToken.symbol === "ETH") {
      return { allowance: MaxUint256 };
    } else {
      const token = await getTokenInstance(selectedToken.address);
      const allowance = await token.allowance(userAddr, limiswapAddr);
      return { allowance };
    }
  } catch (err) {
    throw err;
  }
};

export const hasEnoughBalance = async (
  userAddr: string,
  selectedToken: ITokenInfo,
  amount: BigNumber,
  userBalance?: BigNumber
): Promise<boolean> => {
  if (!userBalance) {
    userBalance = (await getBalanceAllownace(userAddr, selectedToken)).balance;
  }
  return userBalance.gte(amount);
};

export const hasApprovedToken = async (
  userAddr: string,
  selectedToken: ITokenInfo,
  amount: BigNumber,
  approvedAmount?: BigNumber
): Promise<boolean> => {
  if (!approvedAmount) {
    approvedAmount = (await getBalanceAllownace(userAddr, selectedToken))
      .allowance;
  }
  return approvedAmount?.gte(amount) || false;
};

export const approveToken = async (
  selectedToken: ITokenInfo,
  signer: JsonRpcSigner
): Promise<string> => {
  try {
    const token = await getTokenInstance(selectedToken.address, signer);
    const approveTokenTx = await token.approve(limiswapAddr, MaxUint256, { gasLimit: 80_000 });
    const { transactionHash: txHash } = await approveTokenTx.wait(1);
    return txHash;
  } catch (error: any) {
    throw error.message;
  }
};
