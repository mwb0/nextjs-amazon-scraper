// components/ClientHome.tsx
'use client';

import { useEffect  } from 'react';
import useProductStore from '@/store/productStore';
import HeroCarousel from "@/components/HeroCarousel";
import Searchbar from "@/components/Searchbar";
import ProductCard from "@/components/ProductCard";
import { ProductType } from '@/types';
import { getAllProducts } from '@/lib/actions';

const ClientHome = ({ initialProducts }: {initialProducts: ProductType[] | undefined}) => {
  
  const setProducts = useProductStore((state) => state.setProducts);
  const products = useProductStore((state) => state.products);

  useEffect(() => {
    console.log("component did mount", products)
    getAllProducts().then((data: ProductType[] | undefined) => {
      if (data !== undefined) {
        setProducts(data);
      }
    });
  }, [setProducts]);

  return (
    <>
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center"> 
            <h1 className="head-text">
              Amazon Price Tracker
              <span className=""> By Austen Anop</span>
            </h1>
            <p className="mt-6">
              Powerful, self-serve product and growth analytics to help you convert, engage, and retain more.
            </p>
            <Searchbar />
          </div>
          <HeroCarousel />
        </div>
      </section>

      <section className="trending-section">
        <h2 className="section-text">ALL Products</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {
            products?.length === 0 ? initialProducts?.map((product) => (
              <ProductCard key={product._id} product={product} />
            )) : products?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          }
        </div>
      </section>
    </>
  );
};

export default ClientHome;