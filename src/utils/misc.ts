import { ethers } from "ethers";

export const isValidAddress = (...addresses: string[]): boolean => {
  for(const address of addresses){
    if(ethers.utils.isAddress(address) === false){
      return false;
    }
  }
  return true;
}