import styles from "./SlippageModal.module.css";
import { Slider } from "@mui/material";
import React from "react";
import { Modal } from "react-bootstrap";

interface IProps {
  showSetting: boolean
  slippage: number;
  setShowSettings: (value: boolean) => void
  setSlippage: (value: number) => void
}

const SlippageModal: React.FC<IProps> = ({showSetting, slippage, setSlippage, setShowSettings}) => {
  const onSlippageChange = (value: number): number => {
    const slippage = value ** 5;
    const slippageValue = Number(slippage.toFixed(2));
    setSlippage(slippage);
    return slippageValue;
  };

  return (
    <Modal
      show={showSetting}
      onHide={() => setShowSettings(false)}
      backdropClassName={styles.backdropModal}
      contentClassName={styles.contentModal}
      animation={false}
      size="sm"
    >
      <Slider
        id={styles.slider}
        aria-label="Default"
        defaultValue={Math.pow(slippage, 1/5)}
        valueLabelDisplay="auto"
        step={0.01}
        min={0}
        max={2.18672}
        valueLabelFormat={(value) => `${value} %`}
        scale={onSlippageChange}
      />
      <h5>Max slippage: {slippage.toFixed(2)} %</h5>
    </Modal>
  );
};

export default SlippageModal;
