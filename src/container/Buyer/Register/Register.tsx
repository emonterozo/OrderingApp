import React, {useRef, useState} from 'react';
import {
  Box,
  Button,
  FormControl,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
  WarningOutlineIcon,
} from 'native-base';
import {Formik} from 'formik';
import * as Yup from 'yup';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PhoneInput from 'react-native-phone-number-input';

const schema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name is too short!')
    .required('This field is required'),
  number: Yup.string()
    .email('Invalid email address')
    .required('This field is required'),
});

const initial = {
  name: '',
  number: '',
};

const Register = ({navigation}) => {
  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);
  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <VStack w="90%" space={1} marginBottom="10">
        <Heading color="muted.800">Let's Get Started!</Heading>
        <Text color="muted.400">Create an account</Text>
      </VStack>
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
        //withDarkTheme
        //withShadow
        //autoFocus
      />
      <Formik
        initialValues={initial}
        onSubmit={() => {}}
        validationSchema={schema}>
        {({handleChange, handleSubmit, values, errors}) => (
          <>
            <VStack w="90%" space={5}>
              <FormControl isInvalid={'name' in errors}>
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
                  onChangeText={handleChange('name')}
                  value={values.name}
                  variant="rounded"
                  placeholder="Name"
                />
                <FormControl.ErrorMessage
                  ml="3"
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.name}
                </FormControl.ErrorMessage>
              </FormControl>
              <FormControl isInvalid={'email' in errors}>
                <Input
                  InputLeftElement={
                    <Icon
                      as={MaterialCommunityIcons}
                      name="email-outline"
                      color="muted.400"
                      size={5}
                      ml="2"
                    />
                  }
                  onChangeText={handleChange('number')}
                  value={values.number}
                  variant="rounded"
                  placeholder="Email"
                />
                <FormControl.ErrorMessage
                  ml="3"
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.number}
                </FormControl.ErrorMessage>
              </FormControl>
            </VStack>
            <Button
              rounded="full"
              size="lg"
              marginY={10}
              w="60%"
              onPress={() => {
                const checkValid = phoneInput.current?.isValidNumber(value);
                console.log(checkValid);
              }}>
              CREATE
            </Button>
          </>
        )}
      </Formik>
      <HStack w="90%" space={1} justifyContent="center">
        <Text color="muted.900">Already have an account?</Text>
        <Text
          color="blue.400"
          bold
          onPress={() => navigation.navigate('BuyerLogin')}>
          Login here
        </Text>
      </HStack>
    </Box>
  );
};

export default Register;
