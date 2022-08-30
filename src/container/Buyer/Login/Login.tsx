import React, {useContext, useRef, useState} from 'react';
import {Box, Button, Heading, Text, VStack} from 'native-base';
import auth from '@react-native-firebase/auth';
import PhoneInput from 'react-native-phone-number-input';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {StyleSheet} from 'react-native';

import GlobalContext from '../../../config/context';
import {storeUser} from '../../../utils/utils';

const Login = () => {
  const {userType, setUser} = useContext(GlobalContext);
  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [error, setError] = useState('');
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const phoneInput = useRef<PhoneInput>(null);

  // Handle the button press
  const signInWithPhoneNumber = async (phoneNumber: string) => {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  };

  const confirmCode = async () => {
    try {
      await confirm.confirm(code);
      getUser();
      // eslint-disable-next-line no-catch-shadow
    } catch {
      // invalid code
      console.log('Invalid code.');
    }
  };

  const getUser = async () => {
    const token = await messaging().getToken();

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
              fcm_token: token,
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
              fcm_token: token,
              id: documentSnapshot.id,
            };
          });

          firestore()
            .collection('buyers')
            .doc(user.id)
            .update({
              fcm_token: token,
            })
            .then(() => {
              setUser(user);
              storeUser(user);
            });
        }
      });
  };

  const submit = () => {
    /*if (!isOtpScreen) {
      const isValid = phoneInput.current?.isValidNumber(value);
      setError(isValid ? '' : 'Invalid phone number');
      if (isValid) {
        signInWithPhoneNumber(formattedValue);
        setIsOtpScreen(true);
      }
    } else {
      // verify OTP
      confirmCode();
    }*/
    getUser();
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
