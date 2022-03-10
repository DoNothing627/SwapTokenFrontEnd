import './App.css';
import { useState, useEffect } from 'react';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Admin from './Admin';
import swaperABI from './abi/swaperABI.json';
import erc20ABI from './abi/erc20ABI.json';
import { ethers } from 'ethers';
import Address from './Address.json';

function App() {
  const [output, setOutput] = useState('0');
  const [admin, setAdmin] = useState(0);
  const [tokenIn, setTokenIn] = useState(Address.eth);
  const [tokenOut, setTokenOut] = useState(Address.eth);
  const [amount, setAmount] = useState(0);
  const [disabled, setDisabled] = useState(true);
  const [tokenType, setTokenType] = useState(Address.vnd);
  const [accountAddress, setAccountAddress] = useState('');
  const [disabledCheck, setDisabledCheck] = useState(true);
  const [balance, setBalance] = useState('0');

  const resetAdmin = () => {
    setAdmin(0);
    setAdmin(1);
  }

  const reset = () => {
    setAdmin(1);
    setAdmin(0);
    setOutput('0');
    setTokenIn(Address.eth);
    setTokenOut(Address.eth);
    setAmount(0);
    setDisabled(true);
  }

  const getTokenIn = () => {
    var e = document.getElementById("token-in");
    if (e.options[e.selectedIndex].text === "ETH") setTokenIn(Address.eth)
    if (e.options[e.selectedIndex].text === "VND") setTokenIn(Address.vnd)
    if (e.options[e.selectedIndex].text === "USD") setTokenIn(Address.usd)
  }

  const getTokenOut = () => {
    var e = document.getElementById("token-out");
    if (e.options[e.selectedIndex].text === "ETH") setTokenOut(Address.eth)
    if (e.options[e.selectedIndex].text === "VND") setTokenOut(Address.vnd)
    if (e.options[e.selectedIndex].text === "USD") setTokenOut(Address.usd)
  }

  const getAmount = (event) => {
    setAmount(event.target.value);
  }

  useEffect(async () => {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    const swaper = new ethers.Contract(Address.swaper, swaperABI, provider);
    const RATE = await swaper.tokenRate(tokenIn, tokenOut);
    const result = await amount * RATE.rate / (10 ** RATE.rateDecimals);
    await setOutput(result.toString());
  })

  const Swap = async () => {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const swaper = new ethers.Contract(Address.swaper, swaperABI, signer);
    const token = new ethers.Contract(tokenIn, erc20ABI, signer);
    if (await swaper.tokenRate(tokenIn, tokenOut).rate === 0) {
      alert('Admin has not set rate between this two tokens')
      return;
    }
    await provider.send("eth_requestAccounts", []);

    if (tokenIn == Address.eth) {
      try {
        await swaper.swap(tokenIn, tokenOut, 0, { value: amount });
        alert('Successful');
        reset();
      } catch {
        alert('Unknow error');
      }
      return;
    }

    try {
      await token.approve(Address.swaper, amount + 1);
      await swaper.swap(tokenIn, tokenOut, amount);
      alert('Successful');
      reset();
    } catch {
      alert('Unknow error');
    }
  }

  useEffect(() => {
    if (tokenIn === tokenOut) {
      setDisabled(true);
      return;
    }
    if (amount <= 0) {
      setDisabled(true);
      return;
    }
    setDisabled(false);
  }, [tokenIn, tokenOut, amount])

  const getTokenType = () => {
    var e = document.getElementById("token-type");
    if (e.options[e.selectedIndex].text === "VND") setTokenType(Address.vnd)
    if (e.options[e.selectedIndex].text === "USD") setTokenType(Address.usd)
  }

  const getAddress = (event) => {
    setAccountAddress(event.target.value);
  }

  useEffect(() => {
    if (accountAddress.length == 42) {
      setDisabledCheck(false);
      return;
    }
    setDisabledCheck(true);
  }, [accountAddress])

  const Check = async () => {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const token = new ethers.Contract(tokenType, erc20ABI, signer);
    console.log(tokenType);
    try {
      const ans = await token.balanceOf(accountAddress);
      await setBalance(ans.toString());
    } catch {
      alert('Unknow error');
    }
  }

  return (
    <>
      {
        admin == 0 &&
        <div className='manage'>
          <div className="container_swap">
            <div className='header'>
              <h2>Swap Token</h2>
              <AdminPanelSettingsIcon className='icon' onClick={() => setAdmin(1)} />
            </div>
            <div className='body'>
              <div className='pick_token'>
                <input className='coin' type='number' onChange={getAmount} disabled={tokenIn == tokenOut}></input>
                <select className='select' id="token-in" onChange={getTokenIn}>
                  <option>ETH</option>
                  <option>VND</option>
                  <option>USD</option>
                </select>
              </div>
              <div className='pick_token'>
                <select className='select' id="token-out" onChange={getTokenOut}>
                  <option>ETH</option>
                  <option>VND</option>
                  <option>USD</option>
                </select>
                <div className='output'>
                  {output}
                </div>
              </div>
            </div>
            <div className='warning'>
              <h6 style={{ color: disabled == true ? '#FF0000' : '#DDDDDD' }} >Token must be different, amount must greater than 0</h6>
            </div>
            <div className='footer'>
              <button className='swap' disabled={disabled} onClick={Swap}>SWAP</button>
            </div>
          </div>
          <div className='balanceOf'>
            <h2>Balance</h2>
            <select className='token_type' id="token-type" onChange={getTokenType}>
              <option>VND</option>
              <option>USD</option>
            </select>
            <label className='label'>Your Account Address</label>
            <input className='input_address' type='text' onChange={getAddress}></input>
            <button className='check' disabled={disabledCheck} onClick={Check}>Check</button>
            <label className='label'>Your Account Balance</label>
            <div className='balance'>
              {balance}
            </div>
          </div>
        </div>
      }
      {admin == 1 && <Admin quitAdmin={() => setAdmin(0)} resetAdmin={() => resetAdmin()} />}
    </>
  );
}

export default App;
