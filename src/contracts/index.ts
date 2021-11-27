import { ethers } from "ethers";
import {
  ERC20,
  ERC20__factory,
  IUniswapV3Pool,
  IUniswapV3Pool__factory,
  LimiSwap,
  LimiSwap__factory,
} from "./abis/types";
import { getDefaultProvider, TSignerProvider } from "../connectors";
import { checkSigner } from "../interactions/connectwallet";
import tokenList from "./addresses/tokenList.json";
import contractAddr from "./addresses/contractAddr.json";
import { IQuoter } from "./abis/types/IQuoter";
import { IQuoter__factory } from "./abis/types/factories/IQuoter__factory";

export type ListedToken = keyof typeof tokenList;
export const listedTokens = Object.keys(tokenList) as ListedToken[];

export const isListedToken = (token: any): token is ListedToken => {
  return listedTokens.includes(token);
};

export const getTokenAddr = (token: string): string => {
  const tokenAddr = isListedToken(token) ? tokenList[token].address : token;
  return tokenAddr;
};

export const getTokenInstance = async (
  token: string,
  signerOrProvider?: TSignerProvider
): Promise<ERC20> => {
  if (signerOrProvider) {
    await checkSigner(signerOrProvider);
  } else {
    signerOrProvider = getDefaultProvider();
  }
  const tokenAddr = isListedToken(token) ? tokenList[token].address : token;
  return ERC20__factory.connect(tokenAddr, signerOrProvider);
};

export const limiswapAddr = contractAddr.LimiSwap;
export const getLimiSwapInstance = async (
  signerOrProvider?: TSignerProvider
): Promise<LimiSwap> => {
  if (signerOrProvider) {
    await checkSigner(signerOrProvider);
  } else {
    signerOrProvider = getDefaultProvider();
  }
  return LimiSwap__factory.connect(limiswapAddr, signerOrProvider);
};

export const getQuoterInstance = (): IQuoter => {
  const provider = getDefaultProvider();
  const voidSigner = new ethers.VoidSigner(
    ethers.constants.AddressZero,
    provider
  );
  return IQuoter__factory.connect(contractAddr.Quoter, voidSigner);
};

export const getPoolInstance = (poolAddr: string): IUniswapV3Pool => {
  const provider = getDefaultProvider();
  const voidSigner = new ethers.VoidSigner(
    ethers.constants.AddressZero,
    provider
  );
  return IUniswapV3Pool__factory.connect(poolAddr, voidSigner);
};
