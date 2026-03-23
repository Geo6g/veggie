"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockProducts as defaultProducts, categories } from "../data/mockProducts";
import { Product } from "../components/ProductCard";
import { supabase } from "../lib/supabaseClient";

interface ProductContextType {
  products: Product[];
  categories: { id: string; name: string }[];
  updateProduct: (product: Product) => void;
  toggleAvailability: (id: string) => void;
  isLoading: boolean;
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true }); // Just ordering by id to keep it consistent
          
        if (error) {
          console.error("Error fetching from Supabase, using fallback:", error);
          setProducts(defaultProducts);
        } else if (data && data.length > 0) {
          const mappedProducts = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            packSize: item.packsize || item.packSize,
            categoryId: item.categoryid || item.categoryId,
            isAvailable: item.isavailable !== undefined ? item.isavailable : item.isAvailable,
          }));
          setProducts(mappedProducts as Product[]);
        } else {
          // If the table exists but is empty
          setProducts(defaultProducts);
        }
      } catch (err) {
        console.error("Critical error fetching products:", err);
        setProducts(defaultProducts);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  const updateProduct = async (updated: Product) => {
    // Optimistic UI update
    setProducts(products.map(p => p.id === updated.id ? updated : p));
    
    // Sync to Supabase
    const { error } = await supabase.from('products').update(updated).eq('id', updated.id);
    if (error) {
      console.error("Error updating product in Supabase:", error);
      // NOTE: Because RLS is currently read-only for anonymous users, 
      // this will fail until we build the Admin Auth in Phase 3. 
      // The UI will still optimistically update for the user's session!
    }
  };

  const toggleAvailability = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newStatus = !product.isAvailable;
    // Optimistic UI update
    setProducts(products.map(p => p.id === id ? { ...p, isAvailable: newStatus } : p));
    
    // Sync to Supabase
    const { error } = await supabase.from('products').update({ isAvailable: newStatus }).eq('id', id);
    if (error) {
      console.error("Error toggling availability in Supabase:", error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, categories, updateProduct, toggleAvailability, isLoading, selectedCategory, setSelectedCategory }}>
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
      isLoading: false,
      selectedCategory: "all",
      setSelectedCategory: () => {},
    };
  }
  return context;
};
