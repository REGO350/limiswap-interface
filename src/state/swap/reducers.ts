import { createReducer } from "@reduxjs/toolkit";
import { BigNumber } from "ethers";
import { updateTokenState, setTokenIn, setTokenOut, resetAllTokenState } from "./actions";

export interface ITokenState {
  balance?: BigNumber;
  allowance?: BigNumber;
}

interface IState {
  tokenIn: string | undefined;
  tokenOut: string | undefined;
  tokensState: Record<string, ITokenState>;
}

const initialState: IState = {
  tokenIn: "ETH",
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
