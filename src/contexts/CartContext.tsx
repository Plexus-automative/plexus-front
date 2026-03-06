'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export interface CartItem {
    id: string; // Unique identifier for the cart item (usually the itemNo/number)
    vendorNumber: string;
    vendorName: string;
    number: string;
    description: string;
    price: number;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Load cart from localStorage on mount
    React.useEffect(() => {
        const savedCart = localStorage.getItem('plexus_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (err) {
                console.error('Failed to parse cart from localStorage:', err);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save cart to localStorage whenever it changes
    React.useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('plexus_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isInitialized]);

    const addToCart = (newItem: CartItem) => {
        setCartItems((prevItems) => {
            // Check if item already exists in the cart
            const existingItem = prevItems.find((item) => item.id === newItem.id && item.vendorNumber === newItem.vendorNumber);

            if (existingItem) {
                // Increment quantity
                return prevItems.map((item) =>
                    item.id === newItem.id && item.vendorNumber === newItem.vendorNumber
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }

            // Add new item
            return [...prevItems, newItem];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Prevent hydration mismatch by optionally returning null or a placeholder until initialized
    // However, for a provider, it's usually better to just provide the empty state and let sub-components handle loading states if needed
    // In this case, providing an empty cart until localStorage loads is standard.

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
