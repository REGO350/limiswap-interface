import { getProvider, TSignerProvider } from "../connectors";
import {
  getNetworkData,
  networkId,
  web3Modal,
} from "../connectors/network-config";
import { initialState, IState } from "../state/user/reducers";

const addNetwork = async (id: number): Promise<void> => {
  const data = getNetworkData(id);

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: data?.chainId }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [data],
        });
      } catch {
        throw new Error("Failed to add network. Please switch to Rinkeby manually");
      }
    }else{
      throw error;
    }
  }
};

export const connectWallet = async () => {
  if(!web3Modal){
    throw "Error";
  }

  try {
    let host = await web3Modal.connect();
    let provider = getProvider(host);
    let userNetId = (await provider.getNetwork()).chainId;
  
    if (host.isMetaMask && userNetId !== networkId && web3Modal) {
      await addNetwork(networkId);
      host = await web3Modal.connect();
      provider = getProvider(host);
      userNetId = (await provider.getNetwork()).chainId;
      if( userNetId !== networkId ){
        return initialState;
      }
    }
  
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    return {
      host,
      provider,
      signer,
      address,
    };

  } catch (err) {
    throw err;
  }
};

export const disconnectWallet = async (
  host: any
): Promise<IState> => {
  try {
    await host.close();
  } catch (error) {}

  return initialState;
};

export const checkSigner = async (signerOrProvider: TSignerProvider) => {
  if (signerOrProvider.constructor.name === "JsonRpcSigner") {
    try {
      //@ts-ignore
      await signerOrProvider.getAddress();
    } catch {
      throw new Error("Connect Wallet!");
    }
  }
};