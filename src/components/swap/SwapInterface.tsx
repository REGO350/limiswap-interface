import React, { useState, useEffect } from "react";
import { Form, FormControl, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { selectSwap, selectUser } from "../../state";
import * as swapActions from "../../state/swap/actions";
import * as userActions from "../../state/user/actions";
import * as popupActions from "../../state/popup/actions";
import styles from "./SwapInterface.module.css";
import { TokenDropdown } from "./TokenDropdown";
import { createOrder } from "../../interactions/limiswap";
import {
  approveToken,
  getBalanceAllownace,
  hasApprovedToken,
  hasEnoughBalance,
} from "../../interactions/token";
import { useDidUpdateAsyncEffect } from "../../hooks";
import { connectWallet } from "../../interactions/connectwallet";
import SwapButton from "../SwapButton";
import Slider from "@mui/material/Slider";
import { getPair, IPair } from "../../interactions/api";

const SwapInterface = (): JSX.Element => {
  const { address, signer } = useSelector(selectUser);
  const { tokenIn, tokenOut, tokensState } = useSelector(selectSwap);
  const {
    setTxHash,
    updateTokenState,
    updateProvider,
    updateUserInfo,
    setAlertModal,
    setSuccessModal,
    setTokenIn,
    setTokenOut,
    resetAllTokenState,
  } = bindActionCreators(
    { ...swapActions, ...userActions, ...popupActions },
    useDispatch()
  );

  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [input, setInput] = useState<number>(0);
  const [rateValue, setRateValue] = useState<string | undefined>(undefined);
  const [rate, setRate] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(1);
  const [output, setOutput] = useState<number>(0);
  const [pair, setPair] = useState<IPair | undefined>(undefined);

  const [payable, setPayable] = useState<boolean>(false);
  const [approved, setApproved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const onInputChange = (
    e: React.ChangeEvent<typeof FormControl & HTMLInputElement>
  ): void => {
    const inputValueNumber = Number(e.target.value);
    if (inputValueNumber >= 0 && e.target.value) {
      setInput(inputValueNumber);
      setInputValue(e.target.value.toString());
    } else {
      setInput(0);
      setInputValue(undefined);
    }
  };

  const onRateChange = (
    e: React.ChangeEvent<typeof FormControl & HTMLInputElement>
  ): void => {
    const rateValueNumber = Number(e.target.value);
    if (rateValueNumber >= 0 && e.target.value) {
      setRate(rateValueNumber);
      setRateValue(e.target.value.toString());
    } else {
      setRate(0);
      setRateValue(undefined);
    }
  };

  const onSlippageChange = (value: number): number => {
    const slippage = value ** 5;
    const slippageValue = Number(slippage.toFixed(2));
    setSlippage(slippage);
    return slippageValue;
  };

  const onClickSwitchDirection = (): void => {
    const tmp = tokenOut;
    setTokenOut(tokenIn);
    setTokenIn(tmp);
  };

  const onClickSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (address && tokenIn && tokenOut && approved && pair) {
      try {
        setLoading(true);
        const data = await createOrder(
          rate,
          input,
          tokenIn,
          tokenOut,
          pair.poolFee,
          slippage,
          signer
        );
        setTxHash(data);
        setSuccessModal({
          active: true,
          txHash: data,
          message: "Swap Successful",
        });
        await reloadTokens(tokenIn, tokenOut);
      } catch (error: any) {
        setAlertModal({
          active: true,
          title: "Transaction Error!",
          message: error.message,
        });
      } finally {
        setLoading(false);
      }
    } else if (address && tokenIn && tokenOut && !approved) {
      try {
        setLoading(true);
        const data = await approveToken(tokenIn, signer);
        setTxHash(data);
        setSuccessModal({
          active: true,
          txHash: data,
          message: "Approve Successful",
        });
        await reloadTokens(tokenIn);
      } catch (error: any) {
        setAlertModal({
          active: true,
          title: "Transaction Error!",
          message: error.message,
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const { host, provider, signer, address } = await connectWallet();
        updateProvider({ host, provider });
        updateUserInfo({ signer, address });
      } catch (error: any) {
        setAlertModal({
          active: true,
          title: "Connection Error!",
          message: error.message || "Refused to connect",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const reloadTokens = async (...tokens: Array<string>): Promise<void> => {
    setLoading(true);
    for (let token of tokens) {
      if (address) {
        try {
          const data = await getBalanceAllownace(address, token);
          updateTokenState({ [token]: data });
        } catch(err) {
          console.error(err);
        }
      }
    }
    setLoading(false);
  };

  //Account change
  useDidUpdateAsyncEffect(async () => {
    await resetAllTokenState();
    if (address && tokenIn) {
      await reloadTokens(tokenIn);
    }
  }, [address]);

  //tokenIn change
  useDidUpdateAsyncEffect(async () => {
    if (tokenIn && !tokensState.hasOwnProperty(tokenIn)) {
      await reloadTokens(tokenIn);
    }
  }, [tokenIn]);

  //Pair change
  useDidUpdateAsyncEffect(async () => {
    if(tokenIn && tokenOut){
      if(tokenIn !== tokenOut){
        setLoading(true);
        try {
          const pair = await getPair(tokenIn, tokenOut);
          setPrice(pair.tokenOutPrice);
          setPair(pair);
        } catch (err) {
          setPrice(0);
          setPair(undefined);
          console.error(err);
        }
        setLoading(false);
      }else{
        setPrice(1);
        setPair(undefined);
      }
    }
  }, [tokenIn, tokenOut]);

  //Input change
  useDidUpdateAsyncEffect(async () => {
    if(tokenIn && tokenOut){
      if (input && rate) {
        const amount = rate * input;
        setOutput(amount);
      } else if (input && pair) {
        const amount = price * input;
        setOutput(amount);
      } else if (input === 0) {
        setOutput(0);
      }
    }
  }, [input, rate, price]);

  useDidUpdateAsyncEffect(async () => {
    if (address && input && tokenIn && tokenOut) {
      setLoading(true);
      try {
        setPayable(
          await hasEnoughBalance(
            address,
            tokenIn,
            input,
            tokensState[tokenIn]?.balance
          )
        );
        setApproved(
          await hasApprovedToken(
            address,
            tokenIn,
            input,
            tokensState[tokenIn]?.allowance
          )
        );
      } catch (err){
        setPayable(false);
        setApproved(false);
      }
      setLoading(false);
    }
  }, [input])

  return (
    <main className={styles.main}>
      <Form className={styles.box} onSubmit={onClickSubmit}>
        <InputGroup className={styles.inputGroup} id={styles.top}>
          <Form.Control
            className={styles.formControl}
            id={styles.topFormControl}
            inputMode="decimal"
            type="number"
            min="0"
            placeholder="0.00"
            step="any"
            autoComplete="off"
            autoCorrect="off"
            onChange={onInputChange}
            onWheel={(e: any) => e.target.blur()}
            value={inputValue || ""}
            required={address ? true : false}
          />
          <TokenDropdown token={tokenIn} setToken={(token) => setTokenIn(token)} />
        </InputGroup>
        <div className={styles.arrowBox}>
          <h2 onClick={onClickSwitchDirection}>↓</h2>
          <Form.Control
            className={styles.formControl}
            id={styles.midFormControl}
            inputMode="decimal"
            type="number"
            min="0"
            placeholder={rateValue === undefined && price > 0 ? price.toFixed(5) : "0.00"}
            step="any"
            autoComplete="off"
            autoCorrect="off"
            onChange={onRateChange}
            onWheel={(e: any) => e.target.blur()}
            value={rateValue || ""}
            required={address ? true : false}
            style={{"color": pair && rate < price ? "red" : "white"}}
          />
          <div>
            <h6>Slippage: {slippage.toFixed(2)} %</h6>
            <Slider
              id={styles.slider}
              aria-label="Default"
              defaultValue={1}
              valueLabelDisplay="auto"
              step={0.01}
              min={0}
              max={2.18672}
              valueLabelFormat={(value) => `${value} %`}
              scale={onSlippageChange}
            />
          </div>
        </div>

        <InputGroup className={styles.inputGroup} id={styles.bottom}>
          <Form.Control
            className={styles.formControl}
            id={styles.bottomFormControl}
            type="number"
            placeholder="0.00"
            value={output === 0 ? "" : output.toFixed(7)}
            disabled
          />
          <TokenDropdown token={tokenOut} setToken={(token) => setTokenOut(token)} />
        </InputGroup>
        <SwapButton
          loading={loading}
          payable={payable}
          approved={approved}
          hasEntered={input ? true : false}
          isValidPair={pair ? true : false}
        />
      </Form>
    </main>
  );
};

export default SwapInterface;
