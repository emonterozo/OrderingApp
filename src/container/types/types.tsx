export interface IProduct {
  store_id: string;
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
}

export interface ICart {
  store_id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  quantity: number;
}
