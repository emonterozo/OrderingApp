import React, {useContext, useState} from 'react';
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
import firestore from '@react-native-firebase/firestore';
import {omit} from 'lodash';

import GlobalContext from '../../../config/context';
import {storeUser} from '../../../utils/utils';
import {LOADING_TEXT, PROVIDER} from '../../../utils/constant';

const schema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name is too short!')
    .required('This field is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('This field is required'),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character',
    )
    .required('This field is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('This field is required'),
});

const initial = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

interface IValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = ({navigation}: any) => {
  const {userType, setUser} = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);

  const register = (values: IValues, {setFieldError}: any) => {
    setIsLoading(true);

    // will check if email exist
    firestore()
      .collection('sellers')
      .where('email', '==', values.email)
      .get()
      .then(querySnapshot => {
        if (querySnapshot.size > 0) {
          setIsLoading(false);
          setFieldError('email', 'Email already exist');
        } else {
          const data = {
            ...omit(values, 'confirmPassword'),
            store: null,
            provider: PROVIDER.EMAIL,
          };

          // will create new user
          firestore()
            .collection('sellers')
            .add(data)
            .then(snapShot => {
              setIsLoading(false);
              const user = {
                ...data,
                id: snapShot.id,
                userType: userType,
              };
              setUser(user);
              storeUser(user);
            });
        }
      });
  };

  return (
    <Box safeArea flex={1} justifyContent="center" alignItems="center">
      <VStack w="90%" space={1} marginBottom="10">
        <Heading color="muted.800">Let's Get Started!</Heading>
        <Text color="muted.400">Create an account</Text>
      </VStack>
      <Formik
        initialValues={initial}
        onSubmit={register}
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
                  onChangeText={handleChange('email')}
                  value={values.email}
                  variant="rounded"
                  placeholder="Email"
                />
                <FormControl.ErrorMessage
                  ml="3"
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.email}
                </FormControl.ErrorMessage>
              </FormControl>
              <FormControl isInvalid={'password' in errors}>
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
                  onChangeText={handleChange('password')}
                  value={values.password}
                  type="password"
                  variant="rounded"
                  placeholder="Password"
                />
                <FormControl.ErrorMessage
                  ml="3"
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.password}
                </FormControl.ErrorMessage>
              </FormControl>
              <FormControl isInvalid={'confirmPassword' in errors}>
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
                  onChangeText={handleChange('confirmPassword')}
                  value={values.confirmPassword}
                  type="password"
                  variant="rounded"
                  placeholder="Confirm Password"
                />
                <FormControl.ErrorMessage
                  ml="3"
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.confirmPassword}
                </FormControl.ErrorMessage>
              </FormControl>
            </VStack>
            <Button
              isLoading={isLoading}
              isLoadingText={LOADING_TEXT}
              rounded="full"
              size="lg"
              marginY={10}
              w="60%"
              onPress={handleSubmit}>
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
          onPress={() => navigation.navigate('SellerLogin')}>
          Login here
        </Text>
      </HStack>
    </Box>
  );
};

export default Register;
