import 'react-native-gesture-handler';
import React, {useState} from 'react';

import {NativeBaseProvider} from 'native-base';
import GlobalContext from './src/config/context';
import Navigation from './src/navigation/Navigation';

const App = () => {
  const [userType, setUserType] = useState('');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  const initial = {
    userType,
    setUserType,
    user,
    setUser,
    cart,
    setCart,
  };

  return (
    <NativeBaseProvider>
      <GlobalContext.Provider value={initial}>
        <Navigation />
      </GlobalContext.Provider>
    </NativeBaseProvider>
  );
};

export default App;
