import { Price, Token } from "@uniswap/sdk-core";
import { computePoolAddress, FeeAmount, Pool } from "@uniswap/v3-sdk";
import { ITokenInfo } from "../state/swap/reducers";
import contractAddr from "../contracts/addresses/contractAddr.json";
import { getPoolInstance } from "../contracts";
import { IUniswapV3Pool } from "../contracts/abis/types";

const getState = async (pool: IUniswapV3Pool) => {
  const [liquidty, slot0] = await Promise.all([pool.liquidity(), pool.slot0()]);
  return {
    sqrtPriceX96: slot0.sqrtPriceX96.toString(),
    liquidty: liquidty.toString(),
    tick: slot0.tick,
  };
};

export interface IPair {
  poolFee: FeeAmount;
  tokenInPrice: Price<Token, Token>;
  tokenOutPrice: Price<Token, Token>;
}

export const getPair = async (tokenIn: ITokenInfo, tokenOut: ITokenInfo) => {
  const tokenA = new Token(42, tokenIn.address, tokenIn.decimals);
  const tokenB = new Token(42, tokenOut.address, tokenOut.decimals);
  const poolFees = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

  interface Result {
    poolFee: FeeAmount;
    token0Addr: string;
    token1Addr: string;
    token0Price: Price<Token, Token>;
    token1Price: Price<Token, Token>;
  }
  
  const pending = poolFees.map(async (poolFee) => {
    try {
      const poolAddr = computePoolAddress({
        factoryAddress: contractAddr.Factory,
        tokenA,
        tokenB,
        fee: poolFee,
      });
      const { sqrtPriceX96, liquidty, tick } = await getState(
        getPoolInstance(poolAddr)
      );
      const pool = new Pool(
        tokenA,
        tokenB,
        poolFee,
        sqrtPriceX96,
        liquidty,
        tick
      );
      return {
        poolFee,
        token0Addr: pool.token0.address,
        token1Addr: pool.token1.address,
        token0Price: pool.token0Price,
        token1Price: pool.token1Price,
      };
    } catch (err) {
      throw err;
    }
  });
  const data = await Promise.allSettled(pending);
  const results = (data.find(
    (result) => result.status === "fulfilled"
  ) as PromiseFulfilledResult<Result> | undefined)?.value;

  if (results) {
    // console.log(tokenIn.address);
    // console.log(results.token0Addr);
    if(tokenIn.address === results.token0Addr){
      return {
        poolFee: results.poolFee,
        tokenInPrice: results.token1Price,
        tokenOutPrice: results.token0Price
      }
    }else{
      return {
        poolFee: results.poolFee,
        tokenInPrice: results.token0Price,
        tokenOutPrice: results.token1Price
      }
    }
  } else {
    const error = (data.find(
      (res) => res.status === "rejected"
    ) as PromiseRejectedResult | undefined)?.reason;
    throw error;
  }
};
