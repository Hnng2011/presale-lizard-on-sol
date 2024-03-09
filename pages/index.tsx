import { Inter } from 'next/font/google'
import WalletContextProvider from '@/components/WalletContextProvider';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import SendSolForm from '@/components/SendSolForm';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>SolTransfer</title>
        <meta
          name='description'
          content='Wallet Adapter Example'
        />
      </Head>
      <WalletContextProvider>
          <NavBar />
          <SendSolForm />
      </WalletContextProvider>
    </>
  )
}
