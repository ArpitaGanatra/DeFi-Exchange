import { Contract } from "ethers";
import {
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
} from '../constants'

export const getTokensAfterRemove = async(
    provider,
    removeLPTokenWei,
    _ethBalance,
    cryptoDevTokenReserve,
) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        const _totalSupply = await exchangeContract.totalSupply();

        const _removeEther = _ethBalance.mul(removeLPTokenWei).div(_totalSupply);
        const _removeCD = cryptoDevTokenReserve.mul(removeLPTokenWei).div(_totalSupply);
        return {_removeEther, _removeCD}
    } catch (error) {
        console.error(error);
    }
}

export const removeLiquidity = async(signer, removeLPTokensWei) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
        );
        const tx = await exchangeContract.removeLiquidity(removeLPTokensWei);
        await tx.wait();
    } catch (error) {
        console.error(error);
    }
}