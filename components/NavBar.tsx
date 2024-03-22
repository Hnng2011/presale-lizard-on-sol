import { FC, SetStateAction, Dispatch } from "react";
import dynamic from 'next/dynamic';
import { useWallet } from "@solana/wallet-adapter-react";


const ReactUIWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

type SetStateFunction<T> = Dispatch<SetStateAction<T>>;

interface NavBarProps {
    setStateFunction: SetStateFunction<any>; // You can replace `any` with the specific type you're using for state
}

const NavBar: FC<NavBarProps> = ({ setStateFunction }) => {
    const { publicKey } = useWallet();

    function ref_Button_Click() {
        setStateFunction({ status: 'copy' })
        const text = `${window.location.hostname}?ref=${publicKey?.toBase58()}`
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="navbar">
            <button className="ref_button" onClick={() => ref_Button_Click()}> Get REF LINK</button>
            {/* Pass setStateFunction as a prop */}
            <ReactUIWalletMultiButtonDynamic />
        </div>
    )
}

export default NavBar;
