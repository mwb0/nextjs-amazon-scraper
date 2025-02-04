import { create } from 'zustand';
import { ProductType, ProductsStoreType } from '@/types';

const useProductStore = create<ProductsStoreType>((set) => ({
  products: [],
  setProducts: (scrapedProducts: ProductType[]) => set({ products: scrapedProducts}),
}));

export default useProductStore;