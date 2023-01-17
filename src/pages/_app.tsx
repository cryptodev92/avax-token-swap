import '@/src/styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { AuthProvider } from '../context/useAuth';
import Web3ReactManager from '../context/Web3ReactManager';

function getLibrary(provider: any) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ReactManager>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </Web3ReactManager>
    </Web3ReactProvider>
  )
}
