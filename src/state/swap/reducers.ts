import { createReducer } from "@reduxjs/toolkit";
import { BigNumber } from "ethers";
import { getTokenAddr } from "../../contracts";
import { updateTokenState, setTokenIn, setTokenOut, resetAllTokenState } from "./actions";

export interface ITokenState {
  balance?: BigNumber;
  allowance?: BigNumber;
  symbol?: string;
  decimals?: number;
}

export interface ITokenInfo {
  symbol: string;
  address: string;
  decimals: number;
}

interface IState {
  tokenIn?: ITokenInfo
  tokenOut?: ITokenInfo;
  tokensState: Record<string, ITokenState>;
}

const initialState: IState = {
  tokenIn: {
    symbol: "ETH",
    address: getTokenAddr("ETH"),
    decimals: 18
  },
  tokenOut: undefined,
  tokensState: {},
};

export default createReducer<IState>(initialState, (builder) => {
  builder
    .addCase(setTokenIn, (state, { payload }) => {
      return {
        ...state,
        tokenIn: payload,
      };
    })
    .addCase(setTokenOut, (state, { payload }) => {
      return {
        ...state,
        tokenOut: payload,
      };
    })
    .addCase(updateTokenState, (state, { payload }) => {
      let tokensState: Record<string, ITokenState> = state.tokensState;
      Object.entries(payload).forEach(([key, value]) => {
        const tokenState: ITokenState = tokensState[key];
        const mergedState: ITokenState = {
          ...tokenState,
          ...value,
        };
        tokensState = {
          ...tokensState,
          ...{
            [key]: mergedState,
          },
        };
      });

      return {
        ...state,
        tokensState,
      };
    })
    .addCase(resetAllTokenState, (state) => {
      return {
        ...state,
        tokensState: {}
      }
    });
});
