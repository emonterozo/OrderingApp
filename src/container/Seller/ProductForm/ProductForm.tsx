import React, {useContext, useEffect, useState} from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  HStack,
  Image,
  Input,
  Pressable,
  VStack,
} from 'native-base';
import ImagePicker from 'react-native-image-crop-picker';
import {Formik} from 'formik';
import * as Yup from 'yup';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import {isEmpty, isEqual} from 'lodash';

import {AppHeader} from '../../../components';
import {FileImagePlus} from '../../../assets/svg';
import GlobalContext from '../../../config/context';
import {LOADING_TEXT} from '../../../utils/constant';
import {isValidURL} from '../../../utils/utils';

const schema = Yup.object().shape({
  name: Yup.string().required('This field is required'),
  description: Yup.string().required('This field is required'),
  price: Yup.number()
    .required('This field is required')
    .typeError('Must be a valid price'),
});

interface IValues {
  name: string;
  description: string;
  price: number;
}

const ProductForm = ({navigation, route}: any) => {
  const {user} = useContext(GlobalContext);
  const {title, product} = route.params;
  const [imageError, setImageError] = useState('');
  const [images, setImages] = useState(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const initial = {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 99,
  };

  useEffect(() => {
    if (title.includes('Edit')) {
      let holder = [];
      for (let count = 0; count <= 2; count++) {
        holder.push(product.images[count] || '');
      }
      setImages(holder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const handlePressImage = (index: number) => {
    ImagePicker.openPicker({
      width: 700,
      height: 700,
      cropping: true,
    }).then(image => {
      setImageError('');
      const holder = [...images];
      holder[index] = image.path;
      setImages(holder);
    });
  };

  const submit = async (values: IValues) => {
    // return valid images for upload
    const imagesToUpload = images.filter(
      image => !isValidURL(image) && !isEmpty(image),
    );

    if (imageError === '') {
      setIsLoading(true);
      if (title.includes('Add')) {
        // add new product
        const imagesUrl = await uploadImages(imagesToUpload);
        firestore()
          .collection('products')
          .add({
            ...values,
            images: imagesUrl,
            store_id: user.id,
          })
          .then(() => {
            navigation.navigate('SellerHome');
          });
      } else {
        // update product
        let newImages = product.images;

        // will upload new images
        if (imagesToUpload.length) {
          const imagesUrl: string[] = await uploadImages(imagesToUpload);
          newImages = imagesUrl;

          if (
            imagesUrl?.length < product.images.length ||
            imagesUrl?.length === product.images.length
          ) {
            // will get images does not change
            const retainImages = images.filter(
              image => isValidURL(image) && !isEmpty(image),
            );
            newImages = [...imagesUrl, ...retainImages];
          }
        }

        firestore()
          .collection('products')
          .doc(product.id)
          .update({
            ...values,
            images: newImages,
          })
          .then(() => {
            navigation.navigate('SellerHome');
          });
      }
    }
  };

  const uploadImages = async (imagesToUpload: string[]) => {
    try {
      let result = await Promise.all(
        imagesToUpload.map(image => {
          return new Promise((resolve, reject) => {
            const uploadTask = storage()
              .ref(`products/${user.id}/${uuid.v4()}`)
              .putFile(image);
            uploadTask.on(
              'state_changed',
              snapshot => {
                let progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
              },
              reject,
              () => {
                uploadTask.snapshot.ref
                  .getDownloadURL()
                  .then(function (downloadURL) {
                    resolve(downloadURL);
                  });
              },
            );
          });
        }),
      );

      return result;
    } catch (err) {
      console.log(err);
    }
  };

  const checkIfValidImages = () => {
    let holder = images.filter(image => image !== '');
    return holder.length ? true : false;
  };

  const isDataChanged = (values: IValues) => {
    const initialData = {
      ...initial,
      images: title.includes('Edit') ? product.images : images,
    };

    const newData = {
      ...values,
      images: title.includes('Edit')
        ? images.filter(image => image !== '')
        : images,
    };

    return isEqual(initialData, newData);
  };

  return (
    <Box flex={1} safeArea>
      <AppHeader title={title} hasBack navigation={navigation} />
      <Formik
        initialValues={initial}
        onSubmit={submit}
        validationSchema={schema}>
        {({handleChange, handleSubmit, values, errors}) => (
          <VStack mx="3">
            <FormControl isRequired isInvalid={'name' in errors}>
              <FormControl.Label
                _text={{
                  bold: true,
                }}>
                Name
              </FormControl.Label>
              <Input
                placeholder="Product Name"
                onChangeText={handleChange('name')}
                value={values.name}
              />
              <FormControl.ErrorMessage>{errors.name}</FormControl.ErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={'description' in errors}>
              <FormControl.Label
                _text={{
                  bold: true,
                }}>
                Description
              </FormControl.Label>
              <Input
                placeholder="Description"
                multiline
                h="24"
                onChangeText={handleChange('description')}
                value={values.description}
              />
              <FormControl.ErrorMessage>
                {errors.description}
              </FormControl.ErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={'price' in errors}>
              <FormControl.Label
                _text={{
                  bold: true,
                }}>
                Price
              </FormControl.Label>
              <Input
                placeholder="Price"
                onChangeText={handleChange('price')}
                value={values.price.toString()}
              />
              <FormControl.ErrorMessage>
                {errors.price}
              </FormControl.ErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid>
              <FormControl.Label
                _text={{
                  bold: true,
                }}>
                Images
              </FormControl.Label>
              <HStack space={1}>
                {images.map((image, index) => (
                  <Pressable
                    key={index}
                    flex={1}
                    borderWidth="0.5"
                    onPress={() => handlePressImage(index)}>
                    {image === '' ? (
                      <Center>
                        <FileImagePlus
                          height={100}
                          width={100}
                          color="#777777"
                        />
                      </Center>
                    ) : (
                      <Image
                        h={100}
                        source={{
                          uri: image,
                        }}
                        alt="images"
                      />
                    )}
                  </Pressable>
                ))}
              </HStack>
              {imageError === '' ? (
                <FormControl.HelperText>
                  Add upto 3 images
                </FormControl.HelperText>
              ) : (
                <FormControl.ErrorMessage>
                  {imageError}
                </FormControl.ErrorMessage>
              )}
            </FormControl>
            <Button
              isLoading={isLoading}
              isLoadingText={LOADING_TEXT}
              mt="5"
              colorScheme={isDataChanged(values) ? 'trueGray' : 'cyan'}
              disabled={isDataChanged(values)}
              onPress={() => {
                setImageError(
                  checkIfValidImages() ? '' : 'Please add at least 1 image',
                );
                handleSubmit();
              }}>
              Submit
            </Button>
          </VStack>
        )}
      </Formik>
    </Box>
  );
};

export default ProductForm;
