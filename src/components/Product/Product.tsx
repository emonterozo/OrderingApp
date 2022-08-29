import React from 'react';
import {
  AspectRatio,
  Stack,
  Heading,
  Box,
  Pressable,
  Image,
  Text,
} from 'native-base';
import {numberWithCommas} from '../../utils/utils';
import {IProduct} from '../../container/types/types';

interface IProductComponent {
  item: IProduct;
  navigation: any;
}

const Product = ({item, navigation}: IProductComponent) => {
  return (
    <Pressable
      flex={1}
      maxWidth="49%"
      borderWidth="1"
      borderColor="coolGray.300"
      rounded="8"
      onPress={() =>
        navigation.navigate('ProductDetails', {
          product: item,
        })
      }>
      <AspectRatio w="100%">
        <Image
          source={{
            uri: item.images[0],
          }}
          alt={item.name}
        />
      </AspectRatio>
      <Stack p="3" space={3} flex={1}>
        <Stack space={2}>
          <Heading size="md" ml="-1">
            {item.name}
          </Heading>
        </Stack>
        <Text numberOfLines={3} fontWeight="400">
          {item.description}
        </Text>
        <Box flex={1} justifyContent="flex-end" alignItems="flex-end">
          <Text color="coolGray.600" fontWeight="bold">
            {`PHP ${numberWithCommas(item.price)}`}
          </Text>
        </Box>
      </Stack>
    </Pressable>
  );
};

export default Product;
