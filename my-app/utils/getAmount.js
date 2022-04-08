import { Contract } from "ethers";
import {
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
} from '../constants'

export const getEtherBalance = async(provider, address, contract=false) => {
    try {
        if(contract) {
            const balance = provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
            return balance;
        } else {
            const balance = provider.getBalance(address);
            return balance;
        }
        
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export const getCDTokensBalance = async(provider, address) => {
    try {
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            provider
        );
        const balanceOfCryptoDevTokens = await tokenContract.balanceOf(address);
        return balanceOfCryptoDevTokens;
    } catch (error) {
        console.error(error);
    }
}

export const getLPTokensBalance = async(provider, address) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        const balanceOfLPTokens = await exchangeContract.balanceOf(address);
        return balanceOfLPTokens;
    } catch (error) {
        console.error(error);
    }
}

export const getReserveOfCDTokens = async(provider) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        const reserve = await exchangeContract.getReserve();
        return reserve;
    } catch (error) {
        console.error(error);
    }
}