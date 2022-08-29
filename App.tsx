import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import messaging from '@react-native-firebase/messaging';

import {NativeBaseProvider} from 'native-base';
import GlobalContext from './src/config/context';
import Navigation from './src/navigation/Navigation';

const App = () => {
  const [userType, setUserType] = useState('');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // will get message in foreground state
    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    // when FCM open while the app is in background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('onNotificationOpenedApp: ', JSON.stringify(remoteMessage));
    });

    // when FCM open while the app is in quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            JSON.stringify(remoteMessage),
          );
        }
      });
  }, []);

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
