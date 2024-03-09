import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react'


const SendSolForm = () => {
    const [isWl, setWL] = useState(false)
    const [totalraise, setTotalRaise] = useState(0)
    const [loading, setLoading] = useState(false)
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const sendSol = (event: React.FormEvent<HTMLFormElement>) => {
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
                setWL(Boolean(wlData));
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
                    setTotalRaise(0);
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
                                In the real world, it transformed into everything from keychains to memes, a playful reminder of the thrilling alliances and betrayals that unfolded in the virtual spaces it touched.</p>
                            <p>Lizard Presale</p>
                            <p>Symbol: $LIZA</p>
                            <p>Supply: 1,000,000,000 $LIZA</p>
                            <p>Hardcap: 1500 SOL</p>
                        </div>
                    </div>
                </div>
                <div className='presaleform'>
                    <h2>Presale</h2>
                    <h3 className='status'>{totalraise >= 1000 ? 'Closed' : 'Upcoming'} </h3>
                    <div className='totalraise'>
                        <div className='totalraiseinfo'>{formatString(totalraise)} / 1000 SOL</div>
                        <div className='chart' >
                            <div style={{ clipPath: `polygon(0 0, ${(totalraise / 1000) * 100}% 0, ${(totalraise / 1000) * 100}% 100%, 0 100%)` }} className='chartstatus'></div>
                        </div>
                    </div>
                    <form onSubmit={sendSol} className='raiseForm'>
                        <input type="text" id='amount' placeholder='e.g. 0.1' required />
                        <p>Maximum: 3 SOL</p>
                        <button disabled={!isWl || loading} type='submit'> {loading ? 'Funding...' : isWl ? 'Contribute' : 'You are not WL'} </button>
                    </form>
                </div>
            </div >
            <img className='imgSocial' src='/social.jpg' alt='Presale' />
        </>
    )

}

export default SendSolForm