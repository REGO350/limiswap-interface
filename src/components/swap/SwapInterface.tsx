import React, { useEffect, useState } from "react";
import { Badge, Form, FormControl, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { selectSwap, selectUser } from "../../state";
import * as swapActions from "../../state/swap/actions";
import * as userActions from "../../state/user/actions";
import * as popupActions from "../../state/popup/actions";
import styles from "./SwapInterface.module.css";
import { BsGear } from "react-icons/bs";
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
import SwapButton from "./SwapButton";
import { getPair, IPair } from "../../interactions/api";
import SlippageModal from "./SlippageModal";
import { ITokenInfo } from "../../state/swap/reducers";
import { fromWei, toBN, toWei } from "../../utils";

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

  const [showSetting, setShowSettings] = useState<boolean>(false);
  const [showMaxBtn, setShowMaxBtn] = useState<boolean>(false);

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

  const onClickSwitchDirection = (): void => {
    const tmp = tokenOut;
    setTokenOut(tokenIn);
    setTokenIn(tmp);
  };

  const onClickMax = (): void => {
    if(tokenIn){
      const balanceBN = tokensState[tokenIn.address].balance || toBN(0);
      const balance = fromWei(balanceBN, tokenIn.decimals);
      const balanceText = balance > 1 ? balance.toFixed(5) : balance.toFixed(10)
      setInput(balance);
      setInputValue(balanceText);
    }
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

  const reloadTokens = async (...tokens: Array<ITokenInfo>): Promise<void> => {
    setLoading(true);
    for (let token of tokens) {
      if (address) {
        try {
          const data = await getBalanceAllownace(address, token);
          updateTokenState({ [token.address]: data });
        } catch (err) {
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
    if (tokenIn && !tokensState.hasOwnProperty(tokenIn.address)) {
      await reloadTokens(tokenIn);
    }
  }, [tokenIn]);

  useEffect(() => {
    if(tokenIn && tokensState.hasOwnProperty(tokenIn.address)){
      if(tokensState[tokenIn.address].balance?.gt(0)){
        setShowMaxBtn(true);
      }else{
        setShowMaxBtn(false);
      }
    }else{
      setShowMaxBtn(false);
    }
  }, [tokenIn, tokensState])

  //Pair change
  useDidUpdateAsyncEffect(async () => {
    if (tokenIn && tokenOut) {
      if (tokenIn !== tokenOut) {
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
      } else {
        setPrice(1);
        setPair(undefined);
      }
    }
  }, [tokenIn, tokenOut]);

  //Input change
  useDidUpdateAsyncEffect(async () => {
    if (tokenIn && tokenOut) {
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
            tokensState[tokenIn.address]?.balance
          )
        );
        setApproved(
          await hasApprovedToken(
            address,
            tokenIn,
            input,
            tokensState[tokenIn.address]?.allowance
          )
        );
      } catch (err) {
        setPayable(false);
        setApproved(false);
      }
      setLoading(false);
    }
  }, [input]);

  return (
    <main className={styles.main}>
      <Form className={styles.box} onSubmit={onClickSubmit}>
        <div className={styles.boxHeader}>
          <h6 id={styles.boxTitle}>Limit Order Swap</h6>
          <BsGear id={styles.gear} onClick={() => setShowSettings(true)} />
          <SlippageModal
            setSlippage={setSlippage}
            setShowSettings={setShowSettings}
            showSetting={showSetting}
            slippage={slippage}
          />
        </div>
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
          <TokenDropdown
            token={tokenIn}
            setToken={(token) => setTokenIn(token)}
          />
          {showMaxBtn && (
            <Badge
              pill
              bg="secondary"
              id={styles.maxButton}
              onClick={onClickMax}
            >
              Max
            </Badge>
          )}
        </InputGroup>
        <div className={styles.midBox}>
          <Form.Control
            className={styles.formControl}
            id={styles.midFormControl}
            inputMode="decimal"
            type="number"
            min="0"
            placeholder={
              rateValue === undefined && price > 0 ? price.toFixed(5) : "0.00"
            }
            step="any"
            autoComplete="off"
            autoCorrect="off"
            onChange={onRateChange}
            onWheel={(e: any) => e.target.blur()}
            value={rateValue || ""}
            required={address ? true : false}
            style={{ color: pair && rate < price ? "red" : "white" }}
          />
          <h2 onClick={onClickSwitchDirection} id={styles.arrow}>
            ↓
          </h2>
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
          <TokenDropdown
            token={tokenOut}
            setToken={(token) => setTokenOut(token)}
          />
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
