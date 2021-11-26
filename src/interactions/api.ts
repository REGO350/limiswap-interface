import axios from "axios";
import { getTokenAddr } from "../contracts";
import { ITokenInfo } from "../state/swap/reducers";

export interface IPair {
  poolFee: number;
  tokenInPrice: number;
  tokenOutPrice: number;
  tokenInDecimals: number;
  tokenOutDecimals: number;
}

export const getPair = async (
  tokenIn: ITokenInfo,
  tokenOut: ITokenInfo
): Promise<IPair> => {
  const graphAPI = process.env.NEXT_PUBLIC_GRAPH_API || "";
  const tokenInAddr = tokenIn.address.toLowerCase();
  const tokenOutAddr = tokenOut.address.toLowerCase();
  const token0 = tokenInAddr < tokenOutAddr ? tokenInAddr : tokenOutAddr;
  const token1 = tokenInAddr > tokenOutAddr ? tokenInAddr : tokenOutAddr;

  try {
    const result = await axios.post(graphAPI, {
      query: `
          {
            pools(
              first: 1
              orderBy: feeTier
              orderDirection: asc
              where: {
                token0: "${token0}",
                token1: "${token1}"
              }
            ) {
              id
              token0Price
              token1Price
              feeTier
              token0 {
                id
                decimals
              }
              token1 {
                id
                decimals
              }
            }
          }
        `,
    });

    const data = result.data.data.pools[0];
    if(token0 === tokenInAddr){
      return {
        poolFee: Number(data.feeTier),
        tokenInPrice: Number(data.token0Price),
        tokenOutPrice: Number(data.token1Price),
        tokenInDecimals: Number(data.token0.decimals),
        tokenOutDecimals: Number(data.token1.decimals)
      }
    }else{
      return {
        poolFee: Number(data.feeTier),
        tokenInPrice: Number(data.token1Price),
        tokenOutPrice: Number(data.token0Price),
        tokenInDecimals: Number(data.token1.decimals),
        tokenOutDecimals: Number(data.token0.decimals)
      }
    }
  } catch (err){
    throw err;
  }
};
