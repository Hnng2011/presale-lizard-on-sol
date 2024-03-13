import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork, WalletAdapter } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import * as web3 from '@solana/web3.js'
require('@solana/wallet-adapter-react-ui/styles.css');


const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = web3.clusterApiUrl(network);
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={'https://powerful-distinguished-sunset.solana-mainnet.quiknode.pro/fa032f5143d73df4c986c3f3465512c5e77bc40b/?fbclid=IwAR2OAP-wnEr2EMkkMq_sOx-l9nfb2bC_IOgHZJXzcsceNJetInqsbvBoPBA' || endpoint}>
            <WalletProvider wallets={wallets} autoConnect={true}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletContextProvider;