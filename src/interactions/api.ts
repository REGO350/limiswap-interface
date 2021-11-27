import axios, { AxiosResponse } from "axios";
import { ITokenInfo } from "../state/swap/reducers";
import { BigNumber, utils } from "ethers";
import { toBN } from "../utils";
import { getTokenAddr } from "../contracts";

export interface ITokenData {
  address: string,
  name: string,
  symbol: string,
  decimals: number,
  balance: BigNumber
}

export const getUserTokensData = async (
  userAddr: string
) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";
    const erc20 = await axios.get(
      `https://deep-index.moralis.io/api/v2/${userAddr}/erc20?chain=kovan`,
      {
        headers: {
          "X-API-KEY": apiKey
        }
      } 
    ) as AxiosResponse<any[]>;

    const native = await axios.get(
      `https://deep-index.moralis.io/api/v2/${userAddr}/balance?chain=kovan`,
      {
        headers: {
          "X-API-KEY": apiKey
        }
      } 
    ) as AxiosResponse<any>;

    const data: ITokenData[] = erc20.data.map((item: any) => {
      return {
        address: utils.getAddress(item.token_address),
        name: item.name,
        symbol: item.symbol,
        decimals: Number(item.decimals),
        balance: toBN(item.balance)
      }
    })

    data.push({
      address: getTokenAddr("ETH"),
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      balance: toBN(native.data.balance)
    })

    return data;
  } catch (err) {
    throw err;
  }
}

interface IGetTokeMetadata{
  symbol: string,
  decimals: number
}

export const getTokenMetadata = async (
  tokenAddr: string
): Promise<IGetTokeMetadata> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";
    const metadata = await axios.get(
      `https://deep-index.moralis.io/api/v2/erc20/metadata?chain=kovan&addresses=${tokenAddr}`,
      {
        headers: {
          "X-API-KEY": apiKey
        }
      } 
    ) as AxiosResponse<any[]>;

    if(metadata.data[0] !== null){
      return {
        symbol: metadata.data[0].symbol,
        decimals: Number(metadata.data[0].decimals)
      }
    }else{
      throw new Error("Invalid address")
    }
  } catch (err){
    throw err;
  }
}

// export interface IPair {
//   poolFee: number;
//   tokenInPrice: number;
//   tokenOutPrice: number;
//   tokenInDecimals: number;
//   tokenOutDecimals: number;
// }

// export const getPair = async (
//   tokenIn: ITokenInfo,
//   tokenOut: ITokenInfo
// ): Promise<IPair> => {
//   const graphAPI = process.env.NEXT_PUBLIC_GRAPH_API || "";
//   const tokenInAddr = tokenIn.address.toLowerCase();
//   const tokenOutAddr = tokenOut.address.toLowerCase();
//   const token0 = tokenInAddr < tokenOutAddr ? tokenInAddr : tokenOutAddr;
//   const token1 = tokenInAddr > tokenOutAddr ? tokenInAddr : tokenOutAddr;

//   try {
//     const result = await axios.post(graphAPI, {
//       query: `
//           {
//             pools(
//               first: 1
//               orderBy: feeTier
//               orderDirection: asc
//               where: {
//                 token0: "${token0}",
//                 token1: "${token1}"
//               }
//             ) {
//               id
//               token0Price
//               token1Price
//               feeTier
//               token0 {
//                 id
//                 decimals
//               }
//               token1 {
//                 id
//                 decimals
//               }
//             }
//           }
//         `,
//     });

//     const data = result.data.data.pools[0];
//     if(token0 === tokenInAddr){
//       return {
//         poolFee: Number(data.feeTier),
//         tokenInPrice: Number(data.token0Price),
//         tokenOutPrice: Number(data.token1Price),
//         tokenInDecimals: Number(data.token0.decimals),
//         tokenOutDecimals: Number(data.token1.decimals)
//       }
//     }else{
//       return {
//         poolFee: Number(data.feeTier),
//         tokenInPrice: Number(data.token1Price),
//         tokenOutPrice: Number(data.token0Price),
//         tokenInDecimals: Number(data.token1.decimals),
//         tokenOutDecimals: Number(data.token0.decimals)
//       }
//     }
//   } catch (err){
//     throw err;
//   }
// };
