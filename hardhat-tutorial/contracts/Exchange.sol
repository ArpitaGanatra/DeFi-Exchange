//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    // crytp dev token address variable to assign it from the user
    address crytoDevTokenAddress;
    constructor(address _CryptoDevToken) ERC20("CryptoDev LP Token", "CDLP") {
        require(_CryptoDevToken != address(0), "Specify a valid cryptoDevTokenAddress");
        crytoDevTokenAddress = _CryptoDevToken;
    }

    // function to get Reserve of Eth and CryptoDevToken
    // Can get Eth Reserve by address(this).balance

    function getReserve() public view returns(uint256) {
        return ERC20(crytoDevTokenAddress).balanceOf(address(this));
    }
 
    // function to add liquidity
    function addLiquidity(uint256 _amount) public payable returns(uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint cryptoDevTokenReserve = getReserve();
        ERC20 cryptoDevToken = ERC20(crytoDevTokenAddress);

        // if cryptoDevTokenReserve is empty 
        if(cryptoDevTokenReserve == 0) {
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);

            // because it is the first time, otherwise we would have calculated a ratio
            liquidity = ethBalance;
            //mint LP tokens equal to the user's liquidity
            _mint(msg.sender, liquidity);
        } else{
            // if reserve is not empty, LP tokens

            // eth Reserve for the current liquidity call
            uint ethReserve = ethBalance - msg.value;

            // cryptoDevTokens should be in a ratio of
            // (cryptoDevTokens by user / cryptoDevTokenReserve) = (eth by user(=>msg.value) / ethReserve)
            uint cryptoDevTokenAmount = (msg.value * cryptoDevTokenReserve) / ethReserve;
            require(_amount >= cryptoDevTokenAmount, "Amount of tokens sent is less than the minimum tokens required");

            cryptoDevToken.transferFrom(msg.sender, address(this), cryptoDevTokenAmount);

            liquidity = (msg.value * totalSupply()) / ethReserve;
            _mint(msg.sender, liquidity);

        }
        return liquidity;
    }

    // function to remove liquidity
    // would receive amount of LP coins from the user and 
    // returns the amount of ETH and cryptoDevCoins provided back to the user
    function removeLiquidity(uint _amount) public returns(uint, uint) {
        require(_amount > 0, "_amount should be greater than zero");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();

        uint ethAmount = (_amount * ethReserve) / _totalSupply;
        uint crytoDevTokenAmount = (_amount * getReserve()) / _totalSupply;

        // burn the LP coins
        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        ERC20(crytoDevTokenAddress).transfer(msg.sender, crytoDevTokenAmount);
        return(ethAmount, crytoDevTokenAmount);
    }

    // helper function to find how many tokens would be returned in exchange of the other token
    function getAmountOfTokens(
        uint inputAmount,
        uint inputReserve,
        uint outputReserve
    ) public pure returns(uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        
        //we charge 1% trading fee
        // therefore, input Amount after cutting the fees would be
        // inputAmountWithFees = imputAmount - ((1 * inputAmount)/100);
        uint256 inputAmountWithFees = inputAmount * 99;
        uint256 numerator = outputReserve * inputAmountWithFees;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFees;
        return numerator / denominator;
    }

    // function to trade CryptoDevTokens for Eth
    function cryptoDevTokenToEth(uint _tokensSold, uint _minEth) public {
        uint256 tokenReserve = getReserve();
        uint ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "insufficient output amount");
        //transfer tokens from user's address to contract
        ERC20(crytoDevTokenAddress).transferFrom(msg.sender, address(this), _tokensSold);
        // transfer eth to user
        payable(msg.sender).transfer(ethBought);
    }


    // function to trade Eth for CryptoDevToken
    function ethToCryptoDevToken(uint _minTokens) public payable {
        uint256 tokenReserve = getReserve();
        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );
        require(_minTokens >= tokensBought, "insufficient output amount");
        ERC20(crytoDevTokenAddress).transfer(msg.sender, tokensBought);
    }
}