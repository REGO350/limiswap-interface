import { createAction } from "@reduxjs/toolkit";
import { ITokenState } from "./reducers";
import { usePartialRecord } from "../../hooks";

export const setTokenIn = createAction<string | undefined>(
  "swap/setTokenIn"
)
export const setTokenOut = createAction<string | undefined>(
  "swap/setTokenOut"
)
export const updateTokenState = createAction<
  usePartialRecord<string, ITokenState>
>("swap/updateTokenState");

export const resetAllTokenState = createAction("swap/resetAllTokenState");