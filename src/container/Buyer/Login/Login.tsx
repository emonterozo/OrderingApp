import React, {useContext, useEffect} from 'react';
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

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GlobalContext from '../../../config/context';
import {onBackPress} from '../../../utils/utils';

const Login = ({navigation}) => {
  const {setUserType} = useContext(GlobalContext);

  useEffect(() => {
    onBackPress(() => setUserType(''));
  }, []);

  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <VStack w="90%" space={1} marginBottom="10">
        <Heading color="muted.800">Welcome back!</Heading>
        <Text color="muted.400">Login with your existing account</Text>
      </VStack>
      <Text color="error.400" w="85%" mb="2">
        Error
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
          //onChangeText={setEmail}
          //value={email}
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
          //onChangeText={setPassword}
          //value={password}
          type="password"
          variant="rounded"
          placeholder="Password"
        />
      </VStack>
      <Button
        //isLoading={isLoading}
        variant="solid"
        rounded="full"
        size="lg"
        marginY={10}
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
            flex={1}>
            Google
          </Button>
        </HStack>
      </VStack>
      <HStack w="90%" space={1} justifyContent="center" mt={10}>
        <Text color="muted.900">Don't have account?</Text>
        <Text
          color="blue.400"
          bold
          onPress={() => navigation.navigate('BuyerRegister')}>
          Sign Up
        </Text>
      </HStack>
    </Box>
  );
};

export default Login;
