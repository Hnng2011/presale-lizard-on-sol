import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ChangeEvent, useEffect, useState } from 'react'



const SendSolForm = () => {
    const phase: number = 1;
    const [isWl, setWL] = useState(false)
    const [isKol, setKOL] = useState(true)
    const [totalraise, setTotalRaise] = useState(0)
    const [loading, setLoading] = useState(false)
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [sliderValue, setSliderValue] = useState(1);


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
                    { value: 1, label: '1' },
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
        sendTransaction(transaction, connection).then(() => { setLoading(false) }).catch((err) => { console.log(err); setLoading(false); });
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
                Boolean(wlData.isKOL) && setSliderValue(1)
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
                    <h2>Presale</h2>
                    <h3 className='status'>{totalraise >= 1000 ? 'Closed' : 'Upcoming'} </h3>
                    <h2>{phase === 1 ? 'Granduted Round' : 'WL FCFS'}</h2>
                    <div className='totalraise'>
                        <div className='totalraiseinfo'>{formatString(totalraise)} / 1000 SOL</div>
                        <div className='chart' >
                            <div style={{ clipPath: `polygon(0 0, ${(totalraise / 1000) * 100}% 0, ${(totalraise / 1000) * 100}% 100%, 0 100%)` }} className='chartstatus'></div>
                        </div>
                    </div>
                    <form onSubmit={sendSol} className='raiseForm'>
                        <input disabled type="text" id='amount' required value={sliderValue} onChange={handleChange} />
                        <input
                            className="slider"
                            type="range"
                            max={isKol ? 1 : phase === 1 ? 3 : 15}
                            min={1}
                            step={phase === 1 ? 0.5 : 1}
                            value={sliderValue}
                            onChange={handleSliderChange}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontFamily: 'MemeFont2' }}>
                            {marks.map((mark) => (
                                <div style={{ color: 'black', width: '25px', textAlign: 'center' }} key={mark.value}>{mark.label}</div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <p>Min: {marks[0].label} SOL</p>
                            <p>Max: {marks[marks.length - 1].label} SOL</p>
                        </div>
                        <button disabled={!isWl || loading || sliderValue === 0} type='submit'> {loading ? 'Funding...' : isWl ? 'Contribute' : 'You are not WL'} </button>
                    </form>
                </div>
            </div >

        </>
    )

}

export default SendSolForm