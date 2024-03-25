'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ChangeEvent, useEffect, useState, useMemo, useCallback } from 'react'
import NavBar from './NavBar';

const SendSolForm = () => {
    const [noti, setNoti] = useState<{ detail: string, status: string } | null>(null)
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, status: 'close' });
    const [role, setRole] = useState('')
    const [bonus, setBonus] = useState(0)
    const [curBuy, setCurBuy] = useState(0)
    const [totalraise, setTotalRaise] = useState(0)
    const [loading, setLoading] = useState(false)
    const [prevLoading, setPrevLoading] = useState(false);
    const { connection } = useConnection();
    const { publicKey, sendTransaction, } = useWallet();
    const [sliderValue, setSliderValue] = useState(1);
    const [marks, setMarks] = useState([{ value: 1, label: '1' }])
    const phase = useMemo(() => {
        const targetDateUTC = new Date(`${process.env.NEXT_PUBLIC_START_DATE as string}`).getTime();
        const currentDateUTC = new Date().getTime();

        if (currentDateUTC - targetDateUTC >= (73 * 60 * 60 * 1000)) {
            return 4;
        }

        if (currentDateUTC - targetDateUTC >= (48 * 60 * 60 * 1000) + (30 * 60 * 1000)) {
            return 3;
        }

        if (currentDateUTC - targetDateUTC >= 24 * 60 * 60 * 1000) {
            return 2;
        }

        return 1;
    }, [timeLeft]);
    const generatedMarks = useMemo(() => {
        const generateMarks = (phase: number, curBuy: number) => {
            if (phase === 1) {
                const curLeft = 1 - curBuy;

                if (curLeft === 1) {
                    return [{ value: 1, label: '1' }];
                }

                else if (curLeft <= 0) {
                    return [
                        { value: 1, label: '0' },
                    ];
                }
            } else if (phase === 2) {
                const curLeft = 2 - curBuy;
                if (curLeft === 2) {
                    return [
                        { value: 1, label: '1' },
                        { value: 2, label: '1.5' },
                        { value: 3, label: '2' },
                    ];
                } else if (curLeft <= 0) {
                    return [
                        { value: 1, label: '0' },
                    ];
                } else {
                    let marks = [];
                    const ret = curLeft / 0.5;
                    for (let i = 0; i < ret; i++) {
                        marks.push({ value: i + 1, label: `${(i + 1) * 0.5}` });
                    }
                    return marks;
                }
            } else if (phase === 3 || phase === 4) {
                const curLeft = 10 - curBuy;
                if (curLeft === 10) {
                    return [
                        { value: 1, label: '1' },
                        { value: 2, label: '2' },
                        { value: 3, label: '3' },
                        { value: 4, label: '4' },
                        { value: 5, label: '5' },
                        { value: 6, label: '6' },
                        { value: 7, label: '7' },
                        { value: 8, label: '8' },
                        { value: 9, label: '9' },
                        { value: 10, label: '10' },
                    ];
                } else if (curLeft <= 0) {
                    return [
                        { value: 1, label: '0' },
                    ];
                } else {
                    let marks = [];
                    const ret = curLeft;
                    for (let i = 0; i < ret; i++) {
                        marks.push({ value: i + 1, label: `${(i + 1)}` });
                    }
                    return marks;
                }
            }
        };
        const generateMarkss = generateMarks(phase, curBuy);

        return generateMarkss;

    }, [phase, curBuy]);



    const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSliderValue(parseFloat(e.target.value));
    };


    const postRef = () => {
        const postData = {
            address: publicKey?.toBase58(),
            ref: new URL(window.location.href).searchParams.get('ref') || '',
        };
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL as String}/ref`;

        if (postData.address !== postData.ref) {
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Post created successfully:', data);
                })
                .catch(error => {
                    console.error('Error creating post:', error);
                });
        }
    }

    const sendSol = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (timeLeft.status === 'close' || timeLeft.status === 'upcoming') {
            setNoti({ detail: 'Not time for minting.', status: 'failed' })
            return
        }

        else if (phase === 1 && role != 'kol' || phase !== 1 && role === 'kol' || (phase === 2 || phase === 3) && role !== 'wl') {
            setNoti({ detail: 'You don\'t have permission in this round', status: 'failed' })
            return
        }

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
        let txSignature = '';
        await sendTransaction(transaction, connection)
            .then((tx) => {
                txSignature = tx;
            })
            .catch((err) => { setLoading(false); setNoti({ detail: err.toString(), status: 'failed' }) });


        if (!txSignature) {
            return;
        }

        const result = await connection.confirmTransaction(txSignature, 'confirmed');
        if (result) {
            setNoti({ detail: txSignature, status: 'success' })
            setLoading(false);
        }
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
    };

    useEffect(() => {
        if (!publicKey) {
            return;
        }

        postRef();

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
                    throw new Error(`HTTP error! Status: ${wl.status}`);
                }

                const wlData = await wl.json();
                setCurBuy(wlData.currentbuy || 0);
                setRole(wlData.Role || '');
                setBonus(wlData.bonus || 0);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        checkWL();

    }, [publicKey])

    useEffect(() => {
        const urlTR = `${process.env.NEXT_PUBLIC_API_URL as String}/totalraise`;
        const urlWL = `${process.env.NEXT_PUBLIC_API_URL as String}/checkwl?address=${publicKey?.toBase58()}`;
        const checkWL = async () => {
            try {
                const wl = await fetch(urlWL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!wl.ok) {
                    throw new Error(`HTTP error! Status: ${wl.status}`);
                }

                const wlData = await wl.json();
                setCurBuy(wlData.currentbuy || 0);
                setRole(wlData.role || '');
                setBonus(wlData.bonus || 0);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

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
        if (!prevLoading && !loading) {
            checkTotalraise();
        }

        if (prevLoading && !loading) {
            let maxRetry = 3;
            let retryCount = 0;

            const callFunctions = () => {
                setTimeout(() => {
                    checkTotalraise();
                    checkWL();

                    retryCount++;
                    if (retryCount < maxRetry) {
                        callFunctions();
                    }
                }, 1500);
            };

            callFunctions();
        }

        setPrevLoading(loading);
    }, [loading])

    useEffect(() => {
        if (noti) {
            setTimeout(() => {
                setNoti(null);
            }, 5000);
        }
    }, [noti])

    useEffect(() => {
        let targetDateUTC: Date;
        let endDateUTC: Date;

        if (phase == 1) {
            targetDateUTC = new Date(`${process.env.NEXT_PUBLIC_START_DATE as String}`);
            endDateUTC = new Date(targetDateUTC.getTime() + (24 * 60 * 60 * 1000));
        }
        else if (phase == 2) {
            targetDateUTC = new Date(`${process.env.NEXT_PUBLIC_START_DATE as String}`);
            targetDateUTC = new Date(targetDateUTC.getTime() + (24 * 60 * 60 * 1000) + (30 * 60 * 1000));
            endDateUTC = new Date(targetDateUTC.getTime() + (24 * 60 * 60 * 1000));
        }

        else if (phase == 3) {
            targetDateUTC = new Date(`${process.env.NEXT_PUBLIC_START_DATE as String}`);
            targetDateUTC = new Date(targetDateUTC.getTime() + (49 * 60 * 60 * 1000));
            endDateUTC = new Date(targetDateUTC.getTime() + (24 * 60 * 60 * 1000));
        } else if (phase == 4) {
            targetDateUTC = new Date(`${process.env.NEXT_PUBLIC_START_DATE as String}`);
            targetDateUTC = new Date(targetDateUTC.getTime() + (73 * 60 * 60 * 1000) + (30 * 60 * 1000));
            endDateUTC = new Date(targetDateUTC.getTime() + (16 * 60 * 60 * 1000));
        }

        const calculateTimeLeft = (): { days: number; hours: number; minutes: number; seconds: number, status: string } => {
            let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'close' };
            let difference = +new Date(targetDateUTC) - +new Date();

            if (totalraise >= 700) {
                return timeLeft;
            }


            if (difference <= 0) {
                difference = +new Date(endDateUTC) - +new Date();
                if (difference <= 0) {
                    timeLeft = {
                        days: 0,
                        hours: 0,
                        minutes: 0,
                        seconds: 0,
                        status: 'close',
                    };
                }
                else {
                    timeLeft = {
                        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60),
                        status: 'open',
                    };
                }
            }

            else {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                    status: 'upcoming',
                };
            }

            return timeLeft;
        };



        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);

    }, [phase]);

    useEffect(() => {
        setMarks(generatedMarks as { value: number; label: string; }[]);
        setSliderValue(parseFloat(generatedMarks?.[0].label ?? '0'));
    }, [generatedMarks]);

    const checkDisable = () => {
        return phase === 1 && curBuy >= 1 || phase === 2 && curBuy >= 2 || (phase === 3 || phase === 4) && curBuy >= 10 || (phase === 2 || phase === 3) && role !== 'wl' || loading || timeLeft.status === 'close' || timeLeft.status === 'upcoming' || phase === 1 && role !== 'kol' || phase !== 1 && role === 'kol' || totalraise >= 700
            ? true : false
    }



    return (
        <>
            <h2 className='currentround'>Presale Ended</h2>
            {/* <NavBar setStateFunction={setNoti} bonus={bonus} />
            <div className='notistack'>
                {noti?.status === 'success' ? <a target='_blank' href={`https://solscan.io/tx/${noti?.detail}`}><div className='noti' style={{ wordBreak: 'break-all' }}>{'Done.'} <br /> {'TX: '}{noti?.detail}</div></a> : noti?.status === 'failed' ? <div className='noti' style={{ color: 'white', backgroundColor: 'red' }}>{'Failed.'} <br /> {noti?.detail}</div> : noti?.status === 'copy' ? <div className='noti' style={{ width: 'fit-content' }}>{'Copied to Clipboard.'}</div> : null}
            </div>
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
                            <p>HDmpajbL7cvyB8FQSm51H8VrjCD7vc1R72r8Uei79iA</p>
                        </div>
                        <div className='about'>
                            <p>
                                $LIZA, a unique meme token that brings laughter and investment together in the crypto. $LIZA stands out with its playful lizard mascot, symbolizing strength, agility, and adaptability. Our goal is to create a vibrant community where joy, creativity, and active participation are encouraged.</p>
                            <p>Lizard Presale</p>
                            <p>Symbol: $LIZA</p>
                            <p>Supply: 1,000,000,000 $LIZA</p>
                            <p>Hardcap: 700 SOL</p>
                        </div>
                    </div>
                </div>
                <div className='presaleform'>
                    <div>
                        <h2>Presale</h2>
                        <div className='presaleformflex'>
                            <div>  <p>Start in:</p> <img src='/icon.svg' /> <p> March 24 2024 14:00 (UTC)</p></div>
                        </div>
                    </div>

                    <div className='round'>
                        <h2 className='currentround'>{phase === 1 ? 'Whitelist T1' : phase === 2 ? 'Guarantee Round' : phase === 3 ? 'NFT Holder FCFS' : 'Public Round'}</h2>
                        <h3 className='status' style={{ backgroundColor: `${timeLeft.status === 'upcoming' ? 'blue' : timeLeft.status === 'open' ? 'green' : 'red'}` }}>{timeLeft.status === 'upcoming' ? 'Upcoming' : timeLeft.status === 'open' ? 'Open' : 'Closed'}</h3>
                    </div>

                    <div className='timeleftitem'>
                        <div className='dot' style={{ backgroundColor: `${timeLeft.status === 'upcoming' || timeLeft.status === 'close' ? 'red' : 'green'}` }}></div>
                        <p>{timeLeft.status === 'upcoming' || timeLeft.status === 'close' ? 'Open In:' : 'End In:'}</p>
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
                            <div className='totalraiseinfo'>Your Bought: {formatString(curBuy)} / {phase === 1 ? 1 : phase === 2 ? 2 : 10} SOL</div>
                            <div className='totalraiseinfo'>Total Raised: {formatString(totalraise)} SOL</div>
                        </div>
                        <div className='chart'>
                            <div style={{ clipPath: `polygon(0 0, ${(totalraise / 700) * 100}% 0, ${(totalraise / 700) * 100}% 100%, 0 100%)` }} className='chartstatus'></div>
                        </div>
                    </div>
                    <form onSubmit={sendSol} className='raiseForm'>
                        <input disabled type="text" id='amount' required value={sliderValue} />
                        <input
                            className="slider"
                            type="range"
                            max={parseFloat(marks?.[marks?.length - 1]?.label)}
                            min={parseFloat(marks?.[0]?.label)}
                            step={phase === 1 ? 1 : phase === 2 ? 0.5 : 1}
                            value={sliderValue}
                            onChange={handleSliderChange}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontFamily: 'MemeFont2' }}>
                            {marks?.map((mark) => (
                                <div style={{ color: 'black', width: '21px', height: '21px', textAlign: 'center' }} key={mark.value}>{mark.label}</div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <p>Min: {marks?.[0]?.label} SOL</p>
                            <p>Max: {marks?.[marks?.length - 1]?.label} SOL</p>
                        </div>
                        <button disabled={checkDisable()} type='submit' > {loading ? 'Funding...' : (role === 'kol' && phase === 1 || role === 'wl' || phase === 4 && role != 'kol') ? 'Contribute' : 'Ineligible'} </button>
                    </form>
                </div>
            </div> */}
        </>
    )

}

export default SendSolForm