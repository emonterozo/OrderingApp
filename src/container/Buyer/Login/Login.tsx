import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
} from 'native-base';
import auth from '@react-native-firebase/auth';
import PhoneInput from 'react-native-phone-number-input';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import firestore from '@react-native-firebase/firestore';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GlobalContext from '../../../config/context';
import {onBackPress, storeUser} from '../../../utils/utils';
import {StyleSheet} from 'react-native';

const Login = ({navigation}) => {
  const {setUserType, userType, setUser} = useContext(GlobalContext);
  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('+639122011102');
  const [error, setError] = useState('');
  const [isOtpScreen, setIsOtpScreen] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const phoneInput = useRef<PhoneInput>(null);

  useEffect(() => {
    onBackPress(() => setUserType(''));
  }, []);

  // Handle the button press
  const signInWithPhoneNumber = async phoneNumber => {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  };

  const confirmCode = async () => {
    try {
      //2 na ako
      await confirm.confirm(code);
      console.log('valid get firestore');
    } catch (error) {
      getUser();
      console.log('Invalid code.', formattedValue);
    }
  };

  const getUser = () => {
    firestore()
      .collection('buyers')
      .where('number', '==', formattedValue)
      .get()
      .then(querySnapshot => {
        let user = {};
        if (querySnapshot.size === 0) {
          firestore()
            .collection('buyers')
            .add({
              name: '',
              number: formattedValue,
            })
            .then(snapShot => {
              user = {
                id: snapShot.id,
                name: '',
                number: formattedValue,
                userType: userType,
              };
              setUser(user);
              storeUser(user);
            });
        } else {
          querySnapshot.forEach(documentSnapshot => {
            user = {
              ...documentSnapshot.data(),
              id: documentSnapshot.id,
            };
          });
          setUser(user);
          storeUser(user);
        }
      });
  };

  const submit = () => {
    if (!isOtpScreen) {
      const isValid = phoneInput.current?.isValidNumber(value);
      setError(isValid ? '' : 'Invalid phone number');
      if (isValid) {
        signInWithPhoneNumber(formattedValue);
        setIsOtpScreen(true);
      }
    } else {
      console.log('verify otp', code);
      //confirmCode();
      getUser();
    }
  };

  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <VStack w="90%" space={1} marginBottom="10">
        <Heading color="muted.800">Welcome!</Heading>
        <Text color="muted.400">{`Input ${
          isOtpScreen ? 'OTP' : 'phone number'
        } to continue`}</Text>
      </VStack>
      <Text color="error.400" w="85%" mb="2">
        {error}
      </Text>
      {isOtpScreen ? (
        <OTPInputView
          style={styles.container}
          keyboardType="number-pad"
          pinCount={6}
          autoFocusOnLoad
          codeInputFieldStyle={styles.underlineStyleBase}
          codeInputHighlightStyle={styles.underlineStyleHighLighted}
          onCodeFilled={code => {
            setCode(code);
            console.log(`Code is ${code}, you are good to go!`);
          }}
        />
      ) : (
        <PhoneInput
          ref={phoneInput}
          defaultValue={value}
          defaultCode="PH"
          layout="first"
          onChangeText={text => {
            setValue(text);
          }}
          onChangeFormattedText={text => {
            setFormattedValue(text);
          }}
          withDarkTheme
          withShadow
          autoFocus
        />
      )}
      <Button
        variant="solid"
        rounded="full"
        size="lg"
        marginY={10}
        w="60%"
        onPress={submit}>
        Continue
      </Button>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '80%',
    height: 50,
    alignItems: 'center',
  },
  underlineStyleBase: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: 'gray',
    color: 'blue',
  },
  underlineStyleHighLighted: {
    borderColor: '#03DAC6',
  },
});

export default Login;
