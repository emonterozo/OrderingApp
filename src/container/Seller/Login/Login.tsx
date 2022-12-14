import React, {useContext, useEffect, useState} from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import {isEmpty, isEqual} from 'lodash';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import messaging from '@react-native-firebase/messaging';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {storeUser} from '../../../utils/utils';
import GlobalContext from '../../../config/context';
import {LOADING_TEXT, PROVIDER} from '../../../utils/constant';
import {WEB_CLIENT_ID} from '../../../config/config';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
});

const Login = ({navigation}: any) => {
  const {userType, setUser} = useContext(GlobalContext);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = async () => {
    try {
      const token = await messaging().getToken();
      const userInfo = await GoogleSignin.signIn();

      // will check if email exist
      firestore()
        .collection('sellers')
        .where('email', '==', userInfo.user.email)
        .get()
        .then(querySnapshot => {
          if (querySnapshot.size === 0) {
            // email not exist
            const data = {
              email: userInfo.user.email,
              name: `${userInfo.user.givenName} ${userInfo.user.familyName}`,
              password: '',
              store: null,
              provider: PROVIDER.GOOGLE,
              fcm_token: token,
            };
            firestore()
              .collection('sellers')
              .add(data)
              .then(snapShot => {
                const user = {
                  ...data,
                  id: snapShot.id,
                  userType: userType,
                };
                setUser(user);
                storeUser(user);
              });
          } else {
            // email already exist
            querySnapshot.forEach(documentSnapshot => {
              const user = {
                ...documentSnapshot.data(),
                fcm_token: token,
                id: documentSnapshot.id,
                userType: userType,
              };
              updateFCMToken(user.id, token);
              setUser(user);
              storeUser(user);
            });
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const login = () => {
    if (!isEmpty(email) && !isEmpty(password)) {
      setIsLoading(true);

      // will check if email exist
      firestore()
        .collection('sellers')
        .where('email', '==', email)
        .get()
        .then(async querySnapshot => {
          setIsLoading(false);

          if (querySnapshot.size > 0) {
            // email already exist
            const token = await messaging().getToken();
            querySnapshot.forEach(documentSnapshot => {
              const user = {
                ...documentSnapshot.data(),
                fcm_token: token,
                id: documentSnapshot.id,
                userType: userType,
              };
              if (isEqual(user.password, password)) {
                updateFCMToken(user.id, token);
                setUser(user);
                storeUser(user);
              } else {
                setError('Invalid credentials');
              }
            });
          } else {
            setError('Account does not exist');
          }
        });
    }
  };

  const updateFCMToken = async (id: string, token: string) => {
    firestore().collection('sellers').doc(id).update({
      fcm_token: token,
    });
  };

  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <VStack w="90%" space={1} marginBottom="10">
        <Heading color="muted.800">Welcome back!</Heading>
        <Text color="muted.400">Login with your existing account</Text>
      </VStack>
      <Text color="error.400" w="85%" mb="2">
        {error}
      </Text>
      <VStack w="90%" space={5}>
        <Input
          InputLeftElement={
            <Icon
              as={MaterialCommunityIcons}
              name="account-outline"
              color="muted.400"
              size={5}
              ml="2"
            />
          }
          onChangeText={setEmail}
          value={email}
          variant="rounded"
          placeholder="Email"
        />
        <Input
          InputLeftElement={
            <Icon
              as={MaterialCommunityIcons}
              name="lock-outline"
              color="muted.400"
              size={5}
              ml="2"
            />
          }
          onChangeText={setPassword}
          value={password}
          type="password"
          variant="rounded"
          placeholder="Password"
        />
      </VStack>
      <Button
        isLoading={isLoading}
        isLoadingText={LOADING_TEXT}
        variant="solid"
        rounded="full"
        size="lg"
        marginY={10}
        onPress={login}
        w="60%">
        LOG IN
      </Button>
      <VStack w="90%" space={3} alignItems="center">
        <Text color="muted.400">Or connect using</Text>
        <HStack space={3} w="90%">
          <Button
            backgroundColor="#DB4437"
            leftIcon={
              <Icon as={MaterialCommunityIcons} name="google" size="md" />
            }
            size="md"
            flex={1}
            onPress={googleLogin}>
            Google
          </Button>
        </HStack>
      </VStack>
      <HStack w="90%" space={1} justifyContent="center" mt={10}>
        <Text color="muted.900">Don't have account?</Text>
        <Text
          color="blue.400"
          bold
          onPress={() => navigation.navigate('SellerRegister')}>
          Sign Up
        </Text>
      </HStack>
    </Box>
  );
};

export default Login;
