import { Inter } from 'next/font/google'
import WalletContextProvider from '@/components/WalletContextProvider';
import Head from 'next/head';
import SendSolForm from '@/components/SendSolForm';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Presale Lizard</title>
        <meta
          name='description'
          content='Presale Lizard'
        />
        <link rel='icon' href='/fvc.png' />
      </Head>
      <WalletContextProvider>
        <SendSolForm />
      </WalletContextProvider>
    </>
  )
}
