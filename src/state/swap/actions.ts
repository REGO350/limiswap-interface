import { createAction } from "@reduxjs/toolkit";
import { ITokenInfo, ITokenState } from "./reducers";
import { usePartialRecord } from "../../hooks";
import { IPair } from "../../interactions/pool";

export const setTokenIn = createAction<ITokenInfo | undefined>(
  "swap/setTokenIn"
)
export const setTokenOut = createAction<ITokenInfo | undefined>(
  "swap/setTokenOut"
)
export const setPair = createAction<IPair | undefined>(
  "swap/setPair"
)
export const updateTokenState = createAction<
  usePartialRecord<string, ITokenState>
>("swap/updateTokenState");

export const resetAllTokenState = createAction("swap/resetAllTokenState");