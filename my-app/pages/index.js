import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react';
import Web3Modal from "web3modal";
import { BigNumber, providers, utils } from "ethers";
import styles from '../styles/Home.module.css'
import { getCDTokensBalance, getEtherBalance, getLPTokensBalance, getReserveOfCDTokens } from '../utils/getAmount';
import { addLiquidity, calculateCD } from '../utils/addLiquidity';
import { getTokensAfterRemove, removeLiquidity } from '../utils/removeLiquidity';
import { getAmountOfTokensReceivedFromSwap, swapTokens } from '../utils/swap';

export default function Home() {

  const web3ModalRef = useRef();

  const zero = BigNumber.from(0);

  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liquidityTab, setLiquidityTab] = useState(true);
  const [cdBalance, setCDBalance] = useState(zero);
  const [ethBalance, setEtherBalance] = useState(zero);
  const [lpBalance, setLPBalance] = useState(zero);
  const [reservedCD, setReservedCD] = useState(zero);
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);

  const [addEther, setAddEther] = useState(zero);
  const [addCDTokens, setAddCDTokens] = useState(zero);
  const [removeLPTokens, setremoveLPTokens] = useState(zero);
  const [removeEther, setRemoveEther] = useState(zero);
  const [removeCD, setRemoveCD] = useState(zero);

  const [swapAmount, setSwapAmount] = useState('');
  const [ethSelected, setEthSelected] = useState(true);
  const [tokenToBeRecievedAfterSwap, setTokenToBeRecievedAfterSwap] =
  useState(zero);


  const getAmounts = async () => {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const _cdBalance = await getCDTokensBalance(provider, address);
      //get eth balance of user's account
      const _ethBalance = await getEtherBalance(provider, address);
      const _lpBalance = await getLPTokensBalance(provider, address);
      const _reservedCD = await getReserveOfCDTokens(provider);
      //get eth balance of contract
      const _ethBalanceContract = await getEtherBalance(provider, null, true);

      setCDBalance(_cdBalance);
      setEtherBalance(_ethBalance);
      setLPBalance(_lpBalance);
      setReservedCD(_reservedCD);
      setEtherBalanceContract(_ethBalanceContract);
    } catch (error) {
      console.error(error);
    }
  }

  const getProviderOrSigner = async(needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();

    if(chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if(needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  }

  const _addLiquidity = async () => {
    try {
      //convert Eth to bug number
      const addEtherWei = utils.parseEther(addEther.toString());
      if(!addCDTokens.eq(zero) && !addEtherWei.eq(zero)){
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        // call the addLiquidity function from the utils folder
        await addLiquidity(signer, addCDTokens, addEtherWei);
        setLoading(false);
        // Reinitialize the CD tokens
        setAddCDTokens(zero);
        // Get amounts for all values after the liquidity has been added
        await getAmounts();
      } else {
        setAddCDTokens(zero);
      }   
    } catch (error) {
      console.error(error);
    }
  }

  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      const _ethBalance = await getEtherBalance(provider, null, true);
      const cryptoDevTokenReserve = await getReserveOfCDTokens(provider);

      const {_removeEther, _removeCD} = await getTokensAfterRemove(
        provider,
        removeLPTokenWei,
        _ethBalance,
        cryptoDevTokenReserve
      )
      setRemoveEther(_removeEther);
      setRemoveCD(_removeCD);


    } catch (error) {
      console.error(error);
    }
  }

  const _removeLiquidity = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const removeLPTokenWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      await removeLiquidity(
        signer,
        removeLPTokenWei
      );
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    }
  }

  const _getAmountOfTokensReceivedFromSwap = async(_swapAmount) => {
    try {
      const _swapAmountWEI = utils.parseEther(_swapAmount.toString());
      if(!_swapAmountWEI.eq(zero)) {
        const provider = await getProviderOrSigner();
        const _ethBalance = await getEtherBalance(provider, null, true);

        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          _swapAmountWEI,
          provider,
          ethSelected,
          _ethBalance,
          reservedCD
        );
        setTokenToBeRecievedAfterSwap(amountOfTokens)

      } else{
        setTokenToBeRecievedAfterSwap(zero);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const _swapTokens = async () => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount);
      if(!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await swapTokens(
          signer,
          swapAmountWei,
          tokenToBeRecievedAfterSwap,
          ethSelected
        );
        setLoading(false);
        await getAmounts();
        setSwapAmount("");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setSwapAmount("");
    }
  }

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet();
      getAmounts();
    }
  }, [walletConnected])

  const renderButton = () => {
    if(!walletConnected){
      return(
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }
    if(loading) {
      return(
        <button className={styles.button}>Loading...</button>
      )
    }

    if(liquidityTab) {
      return (
        <div>
          <div className={styles.description}>
            You have:
            <br />
            {utils.formatEther(cdBalance)} Crypto Dev Tokens
            <br/>
            {utils.formatEther(ethBalance)} Ether
            <br />
            {utils.formatEther(lpBalance)} Crypto Dev LP Tokens
          </div>

          {/* when the initial liquidity is zero
          i.e reserved CD Token is zero */}
          {utils.parseEther(reservedCD.toString()).eq(zero) ? (
            <div>
              <input
                type="number"
                placeholder="Amount of Ether"
                onChange={(e)=>setAddEther(e.target.value)}
                className={styles.input}
              />
              <input
                type="number"
                placeholder="Amount of CryptoDev tokens"
                onChange={(e)=>setAddCDTokens(
                  BigNumber.from(utils.parseEther(e.target.value || '0'))
                )}
                className={styles.input}
              />
               <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
            </div>
          ) : (
            <div>
              <input
                type="number"
                placeholder="Amount of Ether"
                className={styles.input}
                onChange={async(e) => {
                  setAddEther(e.target.value);
                  const _addCDTokens = await calculateCD(
                    e.target.value || "0",
                    etherBalanceContract,
                    reservedCD
                  )
                  setAddCDTokens(_addCDTokens);
                }}
              />
              <div className={styles.inputDiv}>
                {`You will need ${utils.formatEther(addCDTokens)} CryptoDev Token`}
              </div>
              <button className={styles.button1} onClick={_addLiquidity}>
                  Add
              </button>
            </div>
          )
          }
          <div>
            <input
              type="number"
              placeholder='Amount of LP Tokens'
              className={styles.input}
              onChange={async(e)=> {
                setremoveLPTokens(e.target.value)

                //Calculate how much etha nd CD tokens he will recievr
                //after he removes thr LP tokens
                await _getTokensAfterRemove(e.target.value || "0");
              }}
            />
             <div className={styles.inputDiv}>
             {`You will get ${utils.formatEther(removeEther)} Eth and ${utils.formatEther(removeCD)} CryptoDev Token`}
             </div>
             <button className={styles.button1} onClick={_removeLiquidity}>
                Remove
              </button>
          </div>
          
        </div>
      )
    } else {
      return (
        <div>
          <input
            type="number"
            placeholder="Amount"
            className={styles.input}
            onChange={async(e)=> {
              setSwapAmount(e.target.value || "");
              await _getAmountOfTokensReceivedFromSwap(e.target.value || "0")
            }}
            value={swapAmount}
          />
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async() => {
              setEthSelected(!ethSelected);
              await _getAmountOfTokensReceivedFromSwap(0);
              setSwapAmount("");
            }}
          >
            <option value="eth">Ethereum</option>
            <option value="cryptoDevToken">Crypto Dev Token</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
            {ethSelected
              ? `You will get ${utils.formatEther(
                  tokenToBeRecievedAfterSwap
                )} Crypto Dev Tokens`
              : `You will get ${utils.formatEther(
                  tokenToBeRecievedAfterSwap
                )} Eth`}
          </div>
          <button className={styles.button1} onClick={_swapTokens}>
            Swap
          </button>
        </div>
      )
    }
  }
  
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Exchange-Dapp" />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; Crypto Dev Tokens
          </div>
          <div>
            <button className={styles.button} onClick={()=>setLiquidityTab(!liquidityTab)}>
              Liquidity
            </button>
            <button className={styles.button} onClick={()=>setLiquidityTab(false)}>
              Swap
            </button>
          </div>
          {renderButton()}
        </div>
      </div>
    </div>
  )
}
