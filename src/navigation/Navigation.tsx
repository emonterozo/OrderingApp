import React, {useContext, useEffect} from 'react';
import {
  Home,
  BuyerHome,
  SellerHome,
  BuyerLogin,
  SellerLogin,
  BuyerRegister,
  SellerRegister,
  ProductForm,
  ProductDetails,
  Orders,
  Map,
} from '../container';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import GlobalContext from '../config/context';
import {USER_BUYER} from '../utils/constant';
import {isEmpty, isNull} from 'lodash';
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
      <BuyerAuthStack.Screen name="BuyerRegister" component={BuyerRegister} />
    </BuyerAuthStack.Navigator>
  );
};

const BuyerScreen = () => {
  return (
    <BuyerStack.Navigator screenOptions={{headerShown: false}}>
      <BuyerStack.Screen name="BuyerHome" component={BuyerHome} />
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
    </SellerStack.Navigator>
  );
};

const Navigation = () => {
  const {userType, user, setUser, setUserType} = useContext(GlobalContext);

  useEffect(() => {
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
