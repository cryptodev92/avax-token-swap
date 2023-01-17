import React, { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { Contract } from '@ethersproject/contracts'
import { formatEther, parseUnits } from '@ethersproject/units'
import Swal from 'sweetalert2'
import { useAuthContext } from '../context/useAuth'
import abis from '../utils/avax-testnet.json'
import styles from '../styles/Landing.module.css'

const Landing = () => {
  const injectedConnector = new InjectedConnector({
    supportedChainIds: [43113],
  })

  const { activate, account, library, active } = useWeb3React()
  const { login, logout } = useAuthContext()

  const [walletAddress, setWalletAddress] = useState<string | null | undefined>('')
  const [amount, setAmount] = useState<string | number>(0)
  const [barBalance, setBarBalance] = useState<number>(0)
  const [fooBalance, setFooBalance] = useState<number>(0)
  const [isFunded, setIsFunded] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [fromToken, setFromToken] = useState<string>('foo')
  const [toToken, setToToken] = useState<string>('bar')

  const connectWallet = async () => {
    try {
      await activate(injectedConnector)
      login()
      setWalletAddress(account)
    } catch(err) {
      console.log(err)
    }
  }

  const disconnectWallet = () => {
    logout()
    setWalletAddress(null)
  }

  const claimFooToken = async () => {
    if (!account) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please connect your wallet!'
      })
      return
    }
    if (isFunded) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Funded already!'
      })
      return
    }

    if (active) {
      setIsProcessing(true)
      try {
        const fooContract = new Contract(
          abis.contracts.FooToken.address,
          abis.contracts.FooToken.abi,
          library.getSigner()
        )
  
        const res = await fooContract.fund()
        res
          .wait()
          .then(async (result: any) => {
            await callContract()
            setIsProcessing(false)
          })
          .catch((err: any) => {
            console.log(err)
            setIsProcessing(false)
          })
      } catch (err) {
        console.log(err)
        setIsProcessing(false)
      }
    }
  }

  const swapToken = async () => {
    if (!account) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please connect your wallet!'
      })
      return
    }
    if (active) {
      if (fromToken === toToken) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Can not swap to same token!'
        })
        return
      }
      let fromAddress
      let toAddress
      let fromAbi
      let currentBalance

      if (fromToken === 'foo') {
        currentBalance = fooBalance
        fromAddress = abis.contracts.FooToken.address
        toAddress = abis.contracts.BarToken.address
        fromAbi = abis.contracts.FooToken.abi
      } else {
        currentBalance = barBalance
        fromAddress = abis.contracts.BarToken.address
        toAddress = abis.contracts.FooToken.address
        fromAbi = abis.contracts.BarToken.abi
      }
      if (amount <= 0 || amount > currentBalance) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Input valid amount!'
        })
        return
      }
      setIsProcessing(true)
      try {
        const fromContract = new Contract(fromAddress, fromAbi, library.getSigner())
        const approveTx = await fromContract.approve(abis.contracts.Exchange.address, parseUnits(amount.toString()))
        await approveTx.wait()
  
        const swapContract = new Contract(
          abis.contracts.Exchange.address,
          abis.contracts.Exchange.abi,
          library.getSigner()
        )
  
        const swapTx = await swapContract.swap(fromAddress, toAddress, parseUnits(amount.toString()))
        await swapTx.wait()
        await callContract()
        setIsProcessing(false)
      } catch (err) {
        console.log(err)
        setIsProcessing(false)
      }
    }
  }

  const callContract = async () => {
    try {
      const fooContract = new Contract(
        abis.contracts.FooToken.address,
        abis.contracts.FooToken.abi,
        library.getSigner()
      )
      const barContract = new Contract(
        abis.contracts.BarToken.address,
        abis.contracts.BarToken.abi,
        library.getSigner()
      )
  
      const aBalance = await fooContract.balanceOf(account)
      setFooBalance(parseFloat(formatEther(aBalance)))
  
      const bBalance = await barContract.balanceOf(account)
      setBarBalance(parseFloat(formatEther(bBalance)))
  
      const _isFunded = await fooContract.funded(account)
      setIsFunded(_isFunded)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const callData = async () => {
      await callContract()
    }
    if (account) callData()
  }, [account])
  
  return (
    <div className={styles.landing}>
      <div className={styles.connectWrap}>
        {
          account
            ? (<div>{account.slice(0, 6) + '...' + account.slice(-4)}</div>)
            : <button onClick={connectWallet}>Connect Wallet</button>
        }
        
      </div>
      <div className={styles.balanceZone}>
        <div className={styles.balance}>
          <div>A Token</div>
          <div>{fooBalance}</div>
        </div>
        <div className={styles.balance}>
          <div>B Token</div>
          <div>{barBalance}</div>
        </div>
      </div>
      <div className={styles.swapZone}>
        <button
          className={styles.claimA}
          onClick={claimFooToken}
          disabled={isProcessing}
        >
          Claim token A
        </button>
        <div className={styles.amountZone}>
          <div>Enter amount</div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
          />
          <div>From</div>
          <select
            id="fromToken"
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
          >
            <option value="foo">A</option>
            <option value="bar">B</option>
          </select>
          <div>&gt;&gt;&gt;</div>
          <div>To</div>
          <select
            id="toToken"
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
          >
            <option value="foo">A</option>
            <option value="bar">B</option>
          </select>
        </div>
        <button
          className={styles.swapButton}
          onClick={swapToken}
          disabled={isProcessing}
        >
          Swap
        </button>
      </div>
    </div>
  )
}

export default Landing