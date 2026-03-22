"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockProducts as defaultProducts, categories } from "../data/mockProducts";
import { Product } from "../components/ProductCard";

interface ProductContextType {
  products: Product[];
  categories: { id: string; name: string }[];
  updateProduct: (product: Product) => void;
  toggleAvailability: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("veg-shop-products");
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {
        setProducts(defaultProducts);
      }
    } else {
      setProducts(defaultProducts);
      localStorage.setItem("veg-shop-products", JSON.stringify(defaultProducts));
    }
  }, []);

  const updateProduct = (updated: Product) => {
    const newProducts = products.map(p => p.id === updated.id ? updated : p);
    setProducts(newProducts);
    localStorage.setItem("veg-shop-products", JSON.stringify(newProducts));
  };

  const toggleAvailability = (id: string) => {
    const newProducts = products.map(p => p.id === id ? { ...p, isAvailable: !p.isAvailable } : p);
    setProducts(newProducts);
    localStorage.setItem("veg-shop-products", JSON.stringify(newProducts));
  };

  return (
    <ProductContext.Provider value={{ products, categories, updateProduct, toggleAvailability }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    return {
      products: defaultProducts,
      categories,
      updateProduct: () => {},
      toggleAvailability: () => {},
    };
  }
  return context;
};
