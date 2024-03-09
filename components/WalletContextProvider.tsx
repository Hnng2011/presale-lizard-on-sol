import { FC, ReactNode , useMemo , useCallback} from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider  } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork , Adapter } from '@solana/wallet-adapter-base';
import {PhantomWalletAdapter} from '@solana/wallet-adapter-wallets';
import { type SolanaSignInInput } from '@solana/wallet-standard-features';
import * as web3 from '@solana/web3.js'
import { verifySignIn } from '@solana/wallet-standard-util';
require('@solana/wallet-adapter-react-ui/styles.css');


const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = web3.clusterApiUrl(network);
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}  autoConnect={true}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletContextProvider;