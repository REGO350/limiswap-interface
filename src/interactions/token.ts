import { JsonRpcSigner } from "@ethersproject/providers";
import { MaxUint256 } from "@ethersproject/constants";
import { BigNumber } from "ethers";
import { getDefaultProvider } from "../connectors";
import { getTokenInstance, limiswapAddr } from "../contracts";
import { toWei } from "../utils";

export const getBalanceAllownace = async (
  userAddr: string,
  selectedToken: string
): Promise<{ balance: BigNumber; allowance: BigNumber }> => {
  try {
    if (selectedToken === "ETH") {
      const provider = getDefaultProvider();
      const balance = await provider.getBalance(userAddr);
      return { balance, allowance: MaxUint256 };
    } else {
      const token = await getTokenInstance(selectedToken);
      const balance = await token.balanceOf(userAddr);
      const allowance = await token.allowance(userAddr, limiswapAddr);
      return { balance, allowance };
    }
  } catch (err) {
    throw err;
  }
};

export const hasEnoughBalance = async (
  userAddr: string,
  selectedToken: string,
  amount: number,
  userBalance?: BigNumber
): Promise<boolean> => {
  const amountWei = toWei(amount);
  if (!userBalance) {
    userBalance = (await getBalanceAllownace(userAddr, selectedToken)).balance;
  }
  return userBalance.gte(amountWei) || false;
};

export const hasApprovedToken = async (
  userAddr: string,
  selectedToken: string,
  amount: number,
  approvedAmount?: BigNumber
): Promise<boolean> => {
  const valueWei = toWei(amount);
  if (!approvedAmount) {
    approvedAmount = (await getBalanceAllownace(userAddr, selectedToken))
      .allowance;
  }
  return approvedAmount?.gte(valueWei) || false;
};

export const approveToken = async (
  selectedToken: string,
  signer: JsonRpcSigner
): Promise<string> => {
  try {
    const token = await getTokenInstance(selectedToken, signer);
    const approveTokenTx = await token.approve(limiswapAddr, MaxUint256);
    const { transactionHash: txHash } = await approveTokenTx.wait();
    return txHash;
  } catch (error: any) {
    throw error.message;
  }
};
