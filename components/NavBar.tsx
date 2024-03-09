import { FC } from "react";
import dynamic from 'next/dynamic';

const ReactUIWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const NavBar: FC = () => {
    return (
        <div className="navbar">
            <ReactUIWalletMultiButtonDynamic />
        </div>
    )
}

export default NavBar;
