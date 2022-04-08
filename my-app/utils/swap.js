import { Contract, ethers } from "ethers";
import {
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
} from '../constants'


export const getAmountOfTokensReceivedFromSwap = async (
    _swapAmountWei,
    provider,
    ethSelected,
    ethBalance,
    reservedCD
    ) => {
    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ABI,
        provider
      );

    let amountOfTokens;

    if(ethSelected){
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,
            reservedCD,
            ethBalance
        )
    } else {
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,
            reservedCD,
            ethBalance
          );
    }
    return amountOfTokens;
}

export const swapTokens = async (
    signer,
    swapAmountWei,
    tokenToBeRecievedAfterSwap,
    ethSelected
) => {
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
    let tx;
    if(ethSelected) {
        tx = await exchangeContract.ethToCryptoDevToken(
            tokenToBeRecievedAfterSwap, {
                value: swapAmountWei,
            }
        )
    } else {
        tx=tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            swapAmountWei.toString()
        )
        tx.wait();
        tx=exchangeContract.cryptoDevTokenToEth(
            swapAmountWei,
            tokenToBeRecievedAfterSwap
        )
    }
    await tx.wait();
}