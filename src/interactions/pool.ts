import JSBI from 'jsbi'
import { CurrencyAmount, Percent, Price, Token, TradeType } from "@uniswap/sdk-core";
import { computePoolAddress, FeeAmount, nearestUsableTick, Pool, Route, TickMath, TICK_SPACINGS, Trade } from "@uniswap/v3-sdk";
import { ITokenInfo } from "../state/swap/reducers";
import contractAddr from "../contracts/addresses/contractAddr.json";
import { getPoolInstance } from "../contracts";
import { IUniswapV3Pool } from "../contracts/abis/types";
import { BigNumber } from "ethers";
import { networkId } from '../connectors/network-config';

const getState = async (pool: IUniswapV3Pool) => {
  const [liquidty, slot0] = await Promise.all([pool.liquidity(), pool.slot0()]);
  return {
    sqrtPriceX96: slot0.sqrtPriceX96.toString(),
    liquidity: liquidty.toString(),
    tick: slot0.tick,
  };
};

export interface IPair {
  swapRoute: Route<Token, Token>;
  poolFee: FeeAmount;
  tokenInPrice: Price<Token, Token>;
  tokenOutPrice: Price<Token, Token>;
}

export const getPair = async (tokenIn: ITokenInfo, tokenOut: ITokenInfo) => {
  const tokenA = new Token(networkId, tokenIn.address, tokenIn.decimals);
  const tokenB = new Token(networkId, tokenOut.address, tokenOut.decimals);
  const poolFees = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

  const pending = poolFees.map(async (poolFee) => {
    try {
      const poolAddr = computePoolAddress({
        factoryAddress: contractAddr.Factory,
        tokenA,
        tokenB,
        fee: poolFee,
      });
      const { sqrtPriceX96, liquidity, tick } = await getState(
        getPoolInstance(poolAddr)
      );
      const pool = new Pool(tokenA, tokenB, poolFee, sqrtPriceX96, liquidity, tick, [
          {
            index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[poolFee]),
            liquidityNet: JSBI.BigInt(liquidity),
            liquidityGross: JSBI.BigInt(liquidity)
          },
          {
            index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[poolFee]),
            liquidityNet: JSBI.multiply(JSBI.BigInt(liquidity), JSBI.BigInt(-1)),
            liquidityGross: JSBI.BigInt(liquidity)
          }
        ]);
      return pool;
    } catch (err) {
      throw err;
    }
  });
  const data = await Promise.allSettled(pending);
  const pool = (
    data.find((res) => res.status === "fulfilled") as
      | PromiseFulfilledResult<Pool>
      | undefined
  )?.value;

  if (pool) {
    if (tokenIn.address === pool.token0.address) {
      const swapRoute = new Route([pool], tokenA, tokenB);
      return {
        swapRoute,
        poolFee: pool.fee,
        tokenInPrice: pool.token1Price,
        tokenOutPrice: pool.token0Price,
      };
    } else {
      const swapRoute = new Route([pool], tokenA, tokenB);
      return {
        swapRoute,
        poolFee: pool.fee,
        tokenInPrice: pool.token0Price,
        tokenOutPrice: pool.token1Price,
      };
    }
  } else {
    const error = (
      data.find((res) => res.status === "rejected") as
        | PromiseRejectedResult
        | undefined
    )?.reason;
    throw error;
  }
};

export const getAmountOut = async (amountIn: BigNumber, pair: IPair) => {
  const trade = await Trade.fromRoute(
    pair.swapRoute,
    CurrencyAmount.fromRawAmount(pair.swapRoute.input, amountIn.toString()),
    TradeType.EXACT_INPUT
  );
  const amountOut = trade.minimumAmountOut(new Percent(0, 100));
  return amountOut;
};
