import './App.css';
import { useEffect, useState } from 'react';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import swaperABI from './abi/swaperABI.json';
import { ethers } from 'ethers';
import Address from './Address.json';

function Admin(props) {
    const [tokenIn, setTokenIn] = useState(Address.eth);
    const [tokenOut, setTokenOut] = useState(Address.eth);
    const [rate, setRate] = useState(0);
    const [decimal, setDecimal] = useState(-1);
    const [buttonScript, setButtonScript] = useState("Token must be different, rate must greater than 0");
    const [disabled, setDisabled] = useState(true);
    const [addressNewAdmin, setAddressNewAdmin] = useState('');
    const [disabledSetNewAdmin, setDisabledSetNewAdmin] = useState(true);
    const [tokenRateIn, setTokenRateIn] = useState(Address.eth);
    const [tokenRateOut, setTokenRateOut] = useState(Address.eth);
    const [rateButton, setRateButton] = useState("Token must be different");
    const [rateResult, setRateResult] = useState('Non-existent')

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

    const getRate = (event) => {
        setRate(event.target.value);
    }


    const getDecimal = (event) => {
        setDecimal(event.target.value);
    }

    useEffect(() => {
        if (tokenIn === tokenOut) {
            setDisabled(true);
            setButtonScript("Token must be different, rate must greater than 0");
            return;
        }
        if (rate <= 0 || decimal < 0) {
            setDisabled(true);
            setButtonScript("Token must be different, rate must greater than 0");
            return;
        }
        setDisabled(false);
        setButtonScript("CHANGE");
    }, [tokenIn, tokenOut, rate, decimal])

    const changeRate = async () => {
        const provider = await new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const swaper = new ethers.Contract(Address.swaper, swaperABI, signer);
        await provider.send("eth_requestAccounts", []);
        try {
            console.log(tokenIn, " ", tokenOut, " ", rate, " ", decimal);
            await swaper.changeRate(tokenIn, tokenOut, rate, decimal);
            alert('Successful');
            props.resetAdmin();
        } catch {
            alert('You are not the owner');
        }
    }

    const getAddressNewAdmin = (event) => {
        setAddressNewAdmin(event.target.value);
    }

    useEffect(() => {
        if (addressNewAdmin.length == 42) {
            setDisabledSetNewAdmin(false);
            return;
        }
        setDisabledSetNewAdmin(true);
    }, [addressNewAdmin])

    const setNewAdmin = async () => {
        const provider = await new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const swaper = new ethers.Contract(Address.swaper, swaperABI, signer);
        await provider.send("eth_requestAccounts", []);
        try {
            await swaper.transferOwnership(addressNewAdmin);
            alert('Successful');
        } catch {
            alert('Unknow Error');
        }
    }

    const getTokenGetRateIn = () => {
        var e = document.getElementById("token-get-rate-in");
        if (e.options[e.selectedIndex].text === "ETH") setTokenRateIn(Address.eth)
        if (e.options[e.selectedIndex].text === "VND") setTokenRateIn(Address.vnd)
        if (e.options[e.selectedIndex].text === "USD") setTokenRateIn(Address.usd)
    }

    const getTokenGetRateOut = () => {
        var e = document.getElementById("token-get-rate-out");
        if (e.options[e.selectedIndex].text === "ETH") setTokenRateOut(Address.eth)
        if (e.options[e.selectedIndex].text === "VND") setTokenRateOut(Address.vnd)
        if (e.options[e.selectedIndex].text === "USD") setTokenRateOut(Address.usd)
    }

    useEffect(() => {
        if (tokenRateIn === tokenRateOut) {
            setRateButton("Token must be different");
            return;
        }
        setRateButton("Get rate");
    }, [tokenRateIn, tokenRateOut])

    const getRateResult = async () => {
        const provider = await new ethers.providers.Web3Provider(window.ethereum);
        const swaper = new ethers.Contract(Address.swaper, swaperABI, provider);
        const RATE = await swaper.tokenRate(tokenRateIn, tokenRateOut);
        if (RATE.rate === 0) {
            setRateResult('Non-existent');
            return;
        }
        const result = await RATE.rate / (10 ** RATE.rateDecimals);
        await setRateResult(result.toString());
    }

    return (
        <>
            <div className='manage'>
                <div className="container_admin">
                    <div className='header'>
                        <h2>Admin</h2>
                        <SwapHorizIcon className='icon' onClick={props.quitAdmin} />
                    </div>
                    <div className='body'>
                        <div className='pick_token'>
                            <label>Token In</label>
                            <select className='select' id="token-in" onChange={getTokenIn}>
                                <option>ETH</option>
                                <option>VND</option>
                                <option>USD</option>
                            </select>
                            <label>Token Out</label>
                            <select className='select' id="token-out" onChange={getTokenOut}>
                                <option>ETH</option>
                                <option>VND</option>
                                <option>USD</option>
                            </select>

                        </div>
                        <div className='set_rate'>
                            <input className='coin' type='number' onChange={getRate}></input>
                            <label>Rate</label>
                        </div>
                        <div className='pick_token'>
                            <label>Decimal</label>
                            <input className='coin' type='number' onChange={getDecimal}></input>
                        </div>
                    </div>
                    <div className='footer'>
                        <button className='change' onClick={changeRate} disabled={disabled}>{buttonScript}</button>
                    </div>
                </div>
                <div className='query'>
                    <h2>Query</h2>
                    <label className='label'>New Admin</label>
                    <input className='input_address' type='text' onChange={getAddressNewAdmin}></input>
                    <button className='set-admin' disabled={disabledSetNewAdmin} onClick={setNewAdmin}>Set new admin</button>
                    <div className='get-token'>
                        <label>Token In</label>
                        <select className='select' id="token-get-rate-in" onChange={getTokenGetRateIn} >
                            <option>ETH</option>
                            <option>VND</option>
                            <option>USD</option>
                        </select>
                        <label>Token Out</label>
                        <select className='select' id="token-get-rate-out" onChange={getTokenGetRateOut}>
                            <option>ETH</option>
                            <option>VND</option>
                            <option>USD</option>
                        </select>
                    </div>
                    <button className='set-admin' disabled={tokenRateIn === tokenRateOut} onClick={getRateResult}>{rateButton}</button>
                    <div className='balance'>
                        {rateResult}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Admin;
