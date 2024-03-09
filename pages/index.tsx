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
        <title>Presale Lizard</title>
        <meta
          name='description'
          content='Wallet Adapter Example'
        />
        <link rel='icon' href='/fvc.png' />
      </Head>
      <WalletContextProvider>
          <NavBar />
          <SendSolForm />
      </WalletContextProvider>
    </>
  )
}
