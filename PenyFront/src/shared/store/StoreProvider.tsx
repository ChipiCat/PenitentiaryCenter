import React from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import store from './store';

interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

export default StoreProvider;
