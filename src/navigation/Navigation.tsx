import React, {useContext, useEffect} from 'react';
import {
  Home,
  Store,
  SellerHome,
  BuyerLogin,
  SellerLogin,
  SellerRegister,
  ProductForm,
  ProductDetails,
  Orders,
  Map,
  Cart,
  Chat,
  Message,
} from '../container';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import PushNotification from 'react-native-push-notification';
import {isEmpty, isNull} from 'lodash';

import GlobalContext from '../config/context';
import {NOTIFICATION, USER_BUYER} from '../utils/constant';
import {getUser} from '../utils/utils';

const Stack = createStackNavigator();
const BuyerStack = createStackNavigator();
const SellerStack = createStackNavigator();
const BuyerAuthStack = createStackNavigator();
const SellerAuthStack = createStackNavigator();

const BuyerAuthScreen = () => {
  return (
    <BuyerAuthStack.Navigator screenOptions={{headerShown: false}}>
      <BuyerAuthStack.Screen name="BuyerLogin" component={BuyerLogin} />
    </BuyerAuthStack.Navigator>
  );
};

const BuyerScreen = () => {
  return (
    <BuyerStack.Navigator screenOptions={{headerShown: false}}>
      <BuyerStack.Screen name="Map" component={Map} />
      <BuyerStack.Screen name="Store" component={Store} />
      <SellerStack.Screen name="ProductDetails" component={ProductDetails} />
      <SellerStack.Screen name="Cart" component={Cart} />
      <SellerStack.Screen name="Chat" component={Chat} />
      <SellerStack.Screen name="Message" component={Message} />
      <SellerStack.Screen name="Orders" component={Orders} />
    </BuyerStack.Navigator>
  );
};

const SellerAuthScreen = () => {
  return (
    <SellerAuthStack.Navigator screenOptions={{headerShown: false}}>
      <SellerAuthStack.Screen name="SellerLogin" component={SellerLogin} />
      <SellerAuthStack.Screen
        name="SellerRegister"
        component={SellerRegister}
      />
    </SellerAuthStack.Navigator>
  );
};

const SellerScreen = () => {
  return (
    <SellerStack.Navigator screenOptions={{headerShown: false}}>
      <SellerStack.Screen name="SellerHome" component={SellerHome} />
      <SellerStack.Screen name="ProductForm" component={ProductForm} />
      <SellerStack.Screen name="ProductDetails" component={ProductDetails} />
      <SellerStack.Screen name="Orders" component={Orders} />
      <SellerStack.Screen name="Map" component={Map} />
      <SellerStack.Screen name="Chat" component={Chat} />
      <SellerStack.Screen name="Message" component={Message} />
    </SellerStack.Navigator>
  );
};

const Navigation = () => {
  const {userType, user, setUser, setUserType} = useContext(GlobalContext);

  useEffect(() => {
    PushNotification.createChannel({
      channelId: NOTIFICATION.CHANNEL_ID,
      channelName: NOTIFICATION.CHANNEL_NAME,
    });
    getUser().then(res => {
      setUserType(isNull(res) ? '' : res.userType);
      setUser(res);
    });
  }, []);

  const checkUser = () => {
    if (userType === USER_BUYER) {
      return isNull(user) ? <BuyerAuthScreen /> : <BuyerScreen />;
    } else {
      return isNull(user) ? <SellerAuthScreen /> : <SellerScreen />;
    }
  };

  return (
    <NavigationContainer>
      {isEmpty(userType) ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      ) : (
        checkUser()
      )}
    </NavigationContainer>
  );
};
export default Navigation;
