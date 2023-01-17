import React, { useState, createContext, useEffect, useContext } from 'react';
import Web3 from 'web3';
import { useWeb3React } from '@web3-react/core';
import Swal from 'sweetalert2';

interface AuthProps {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

type Props = {
  children?: React.ReactNode
};

const AuthContext = createContext<AuthProps>({} as AuthProps);

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const { deactivate } = useWeb3React();
  const [isAuthenticated, setIsAuthernticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = async () => {
    const wa = window as any;
    if (window.hasOwnProperty('ethereum')) {
      wa.web3 = new Web3(wa.ethereum);
      await wa.ethereum.enable();
    } else if (window.hasOwnProperty('web3')) {
      wa.web3 = new Web3(wa.web3.currentProvider);
    } else {
      return;
    }

    // const accounts = await wa.web3.eth.getAccounts();
    // const token: string = Math.floor(Math.random() * 100000).toString();
    // const signature = await wa.web3.eth.personal.sign(
    //   `Test Signature : ${token}`,
    //   wa.web3.utils.toChecksumAddress(accounts[0]),
    //   '',
    // );

    // const payload = {
    //   address: wa.web3.utils.toChecksumAddress(accounts[0]),
    //   token: `Test Signature : ${token}`,
    //   signature: signature,
    // };

    // console.log('===========', payload);

    // mock up
    // localStorage.setItem('testToken', res.data.accessToken); save access token from backend
    // localStorage.setItem('testUser', res.data.userInfo); save use info from backend
    setIsAuthernticated(true);
    // setUser(res.data.userInfo); 

    // Swal.fire({
    //   icon: 'success',
    //   title: 'Success',
    //   text: 'Successfully logged in!'
    // });
  };

  const logout = () => {
    deactivate();
    localStorage.removeItem('testToken');
    localStorage.removeItem('testUser');
    setIsAuthernticated(false);
    setUser(null);
  };

  useEffect(() => {
    const authUser = () => {
      const testToken = localStorage.getItem('testToken');
      const userInfo = localStorage.getItem('testUser');
      setIsAuthernticated(testToken ? true : false);
      setUser(JSON.parse(String(userInfo)));
    };
    authUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  return useContext(AuthContext);
};