'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ChangeEvent, useEffect, useState } from 'react'



const SendSolForm = () => {
    const targetDateUTC = new Date(`${process.env.NEXT_PUBLIC_START_DATE as String}`);
    const endDate = new Date(`${process.env.NEXT_PUBLIC_END_DATE as String}`);

    const calculateTimeLeft = (): { days: number; hours: number; minutes: number; seconds: number, status: string } => {
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'close' };
        let difference = +new Date(targetDateUTC) - +new Date();

        if (difference <= 0) {
            difference = +new Date(endDate) - +new Date();
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                status: 'open',
            };
        }
        else {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                status: 'close',
            };
        }

        return timeLeft;
    };

    const phase: number = 1;
    const [noti, setNoti] = useState(null)
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, status: 'close' });
    const [isWl, setWL] = useState(false)
    const [isKol, setKOL] = useState(true)
    const [curBuy, setCurBuy] = useState(0)
    const [totalraise, setTotalRaise] = useState(0)
    const [loading, setLoading] = useState(false)
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [sliderValue, setSliderValue] = useState(0.1);


    const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSliderValue(parseFloat(e.target.value));
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const parsedValue = parseFloat(e.target.value);
        let result = 0;
        if (isKol) {
            result = 1;
        } else if (phase === 1) {
            result = 3;
        } else {
            result = 15;
        }

        if (parsedValue > result) {
            setSliderValue(result);
        }

        else if (parsedValue < 1 || isNaN(parsedValue)) {
            setSliderValue(1);
        }

        else {
            setSliderValue(parsedValue);
        }
    };




    const marks =
        isKol ? [{ value: 0, label: '1' }]
            : phase !== 1
                ? [
                    { value: 0, label: '1' },
                    { value: 1, label: '2' },
                    { value: 2, label: '3' },
                    { value: 3, label: '4' },
                    { value: 4, label: '5' },
                    { value: 5, label: '6' },
                    { value: 6, label: '7' },
                    { value: 7, label: '8' },
                    { value: 8, label: '9' },
                    { value: 9, label: '10' },
                    { value: 10, label: '11' },
                    { value: 11, label: '12' },
                    { value: 12, label: '13' },
                    { value: 13, label: '14' },
                    { value: 14, label: '15' },
                ]
                : [
                    { value: 1, label: '0.1' },
                    { value: 2, label: '1.5' },
                    { value: 3, label: '2' },
                    { value: 4, label: '2.5' },
                    { value: 5, label: '3' },
                ];

    const sendSol = (event: React.FormEvent<HTMLFormElement>) => {
        if (!isWl) {
            console.log('You are not WL , please do not try to send transaction.');
            return;
        }

        if (timeLeft.status === 'close') {
            console.log('Not time for minting yet.');
            return;
        }

        event.preventDefault();
        setLoading(true)
        if (!connection || !publicKey) {
            return;
        }

        const target = event.target as typeof event.target & {
            amount: { value: string };
        };

        const transaction = new web3.Transaction();
        const recipientPubKey = new web3.PublicKey(process.env.NEXT_PUBLIC_PUBLIC_WALLET as string);

        const sendSolInstruction = web3.SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubKey,
            lamports: LAMPORTS_PER_SOL * parseFloat(target.amount.value)
        });

        transaction.add(sendSolInstruction);
        sendTransaction(transaction, connection).then((tx) => { setLoading(false); console.log(tx) }).catch((err) => { console.log(err); setLoading(false); });
    };

    function formatString(total: number) {
        var totalString = total.toString();
        var dotIndex = totalString.indexOf('.');

        if (dotIndex !== -1) {
            var formatTotal = totalString.substring(0, dotIndex + 3);
            return parseFloat(formatTotal);
        } else {
            return total;
        }
    }

    useEffect(() => {
        if (!publicKey) {
            setWL(false);
            return;
        }

        const urlWL = `${process.env.NEXT_PUBLIC_API_URL as String}/checkwl?address=${publicKey.toBase58()}`;
        const checkWL = async () => {
            try {
                const wl = await fetch(urlWL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!wl.ok) {
                    setWL(false);
                    throw new Error(`HTTP error! Status: ${wl.status}`);
                }

                const wlData = await wl.json();
                setKOL(Boolean(wlData.isKOL));
                setCurBuy(wlData.currentBuy || 0);
                setWL(true);
            } catch (error) {
                console.error("Error fetching data:", error);
                setWL(false);
            }
        }
        checkWL();

    }, [publicKey])

    useEffect(() => {
        const urlTR = `${process.env.NEXT_PUBLIC_API_URL as String}/totalraise`;
        const checkTotalraise = async () => {
            try {
                const totalraise = await fetch(urlTR, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!totalraise.ok) {
                    throw new Error(`HTTP error! Status: ${totalraise.status}`);
                }

                const totalraiseData = await totalraise.json();
                setTotalRaise(totalraiseData.totalCurrentBuy);
            } catch (error) {
                console.error("Error fetching data:", error);
                setTotalRaise(0);
            }
        }

        !loading && checkTotalraise();
    }, [loading])

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <div className='container'>
                <div className='informpresale'>
                    <img className='imgSocial' src='/social.jpg' alt='Presale' />
                    <div className='inform'>
                        <div className='social'>
                            <div className='left'>
                                <video src='/coin.webm' autoPlay loop muted></video>
                                <h3>Lizard</h3>
                            </div>
                            <div className='right'>
                                <a href={process.env.NEXT_PUBLIC_PUBLIC_WEB} target='_blank'><img alt='web' src='/web.png' /></a>
                                <a href={process.env.NEXT_PUBLIC_PUBLIC_X} target='_blank'><img alt='twitter' src='/x.svg' /></a>
                                <a href={process.env.NEXT_PUBLIC_PUBLIC_TELE} target='_blank'><img alt='telegram' src='/tele.svg' /></a>
                            </div>
                        </div>
                        <div className='address'>
                            <h3>Token Address: </h3>
                            <p>TBA</p>
                        </div>
                        <div className='about'>
                            <p>
                                $LIZA, a unique meme token that brings laughter and investment together in the crypto. $LIZA stands out with its playful lizard mascot, symbolizing strength, agility, and adaptability. Our goal is to create a vibrant community where joy, creativity, and active participation are encouraged.</p>
                            <p>Lizard Presale</p>
                            <p>Symbol: $LIZA</p>
                            <p>Supply: 1,000,000,000 $LIZA</p>
                            <p>Hardcap: 1000 SOL</p>
                        </div>
                    </div>
                </div>
                <div className='presaleform'>
                    <div>
                        <h2>Presale</h2>
                        <div className='presaleformflex'>
                            <div>  <p>Granduted Round start:</p> <img src='/icon.svg' /> <p> March 12 2024 10:00 (UTC)</p></div>
                            <div><p>WL FCFS start:</p>  <img src='/icon.svg' />  <p> March 13 2024 10:00 (UTC)</p></div>
                        </div>
                    </div>

                    <div className='round'>
                        <h2 className='currentround'>{phase === 1 ? 'Granduted Round' : 'WL FCFS'}</h2>
                        <h3 className='status' style={{ backgroundColor: `${timeLeft.status === 'close' ? 'red' : 'green'}` }}>{totalraise >= 1000 || timeLeft.status === 'close' ? 'Closed' : 'Upcoming'}</h3>
                    </div>

                    <div className='timeleftitem'>
                        <div className='dot' style={{ backgroundColor: `${timeLeft.status === 'close' ? 'red' : 'green'}` }}></div>
                        <p>{timeLeft.status === 'close' ? 'Open In:' : 'End In:'}</p>
                        <div><p>{timeLeft.days}</p><p>Days</p></div>
                        <div><p>:</p></div>
                        <div><p>{timeLeft.hours}</p><p>Hours</p></div>
                        <div><p>:</p></div>
                        <div><p>{timeLeft.minutes}</p><p>Minutes</p></div>
                        <div><p>:</p></div>
                        <div><p>{timeLeft.seconds}</p><p>Seconds</p></div>
                    </div>

                    <div className='totalraise'>
                        <div className='total'>
                            <div className='totalraiseinfo'>Your Bought: {formatString(curBuy)} / {isKol ? 1 : phase === 1 ? 3 : 15} SOL</div>
                            <div className='totalraiseinfo'>Total Raised: {formatString(totalraise)} / 1000 SOL</div>
                        </div>
                        <div className='chart'>
                            <div style={{ clipPath: `polygon(0 0, ${(totalraise / 1000) * 100}% 0, ${(totalraise / 1000) * 100}% 100%, 0 100%)` }} className='chartstatus'></div>
                        </div>
                    </div>
                    <form onSubmit={sendSol} className='raiseForm'>
                        <input disabled type="text" id='amount' required value={sliderValue} onChange={handleChange} />
                        <input
                            className="slider"
                            type="range"
                            max={isKol ? 1 : phase === 1 ? 3 : 15}
                            min={0.1}
                            step={phase === 1 ? 0.5 : 1}
                            value={sliderValue}
                            onChange={handleSliderChange}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontFamily: 'MemeFont2' }}>
                            {marks.map((mark) => (
                                <div style={{ color: 'black', width: '21px', height: '21px', textAlign: 'center' }} key={mark.value}>{mark.label}</div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <p>Min: {marks[0].label} SOL</p>
                            <p>Max: {marks[marks.length - 1].label} SOL</p>
                        </div>
                        <button disabled={!isWl || loading || timeLeft.status === 'close'} type='submit'> {loading ? 'Funding...' : isWl ? 'Contribute' : 'You are not WL'} </button>
                    </form>
                </div>
            </div >

        </>
    )

}

export default SendSolForm