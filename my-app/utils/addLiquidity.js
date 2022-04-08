import { Contract, utils } from "ethers";
import {
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
} from '../constants'

export const calculateCD = async (
    _addEther = "0",
    etherBalanceContract,
    cdTokenReserve
) => {
    //_add Ether is a string, we nwwd to convert it to big number

    const _addEtherAmountWei = utils.parseEther(_addEther);

    const CryptoDevTokenAmount = _addEtherAmountWei.mul(cdTokenReserve).div(etherBalanceContract);
    return CryptoDevTokenAmount;
}

export const addLiquidity = async (
    signer,
    addCDAmountWei,
    addEtherAmountWei
) => {
    try {
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            signer
          );
          // create a new instance of the exchange contract
          const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
          );

          let tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            addCDAmountWei.toString()
          )
          await tx.wait();

          tx = await exchangeContract.addLiquidity(addCDAmountWei, {
              value: addEtherAmountWei
          })

          await tx.wait();
        
    } catch (error) {
        console.log(error);
    }
}