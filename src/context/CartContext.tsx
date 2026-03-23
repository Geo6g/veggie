"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  packSize: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  toast: { message: string, id: number } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  
  // Ref to prevent infinite loops when syncing from DB vs saving to DB
  const isInitializing = useRef(true);

  // Load from local or supabase on mount / user change
  useEffect(() => {
    setMounted(true);
    
    const loadCart = async () => {
      isInitializing.current = true;
      if (user) {
        const { data, error } = await supabase.from('user_carts').select('items').eq('user_id', user.id).single();
        if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        } else {
          // Sync local storage to DB if DB is empty
          const localCart = localStorage.getItem("veg-shop-cart");
          if (localCart) {
            try {
              const parsed = JSON.parse(localCart);
              if (parsed.length > 0) {
                setItems(parsed);
                await supabase.from('user_carts').upsert({ user_id: user.id, items: parsed, updated_at: new Date().toISOString() });
              }
            } catch (e) {
              console.error("Cart parse error", e);
            }
          }
        }
      } else {
        const savedCart = localStorage.getItem("veg-shop-cart");
        if (savedCart) {
          try { setItems(JSON.parse(savedCart)); } catch (e) {}
        }
      }
      setTimeout(() => isInitializing.current = false, 500); // Allow time for set state to process
    };
    
    loadCart();
  }, [user]);

  // Save to local & supabase on change
  useEffect(() => {
    if (mounted && !isInitializing.current) {
      localStorage.setItem("veg-shop-cart", JSON.stringify(items));
      
      if (user) {
        supabase.from('user_carts')
          .upsert({ user_id: user.id, items, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (error) console.error("Error saving cart to Supabase:", error);
          });
      }
    }
  }, [items, mounted, user]);

  const addToCart = (product: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    const id = Date.now();
    setToast({ message: "Item added to cart", id });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 1500);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        toast,
      }}
    >
      {children}
      
      {toast && (
        <div className="toast-notification animate-slide-up">
          {toast.message}
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
      items: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      cartTotal: 0,
      itemCount: 0,
      isCartOpen: false,
      setIsCartOpen: () => {},
      toast: null,
    };
  }
  return context;
};
