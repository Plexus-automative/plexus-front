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
    isAdaptable?: boolean;
    chassisNo?: string;
}


interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    toggleAdaptable: (itemId: string, isAdaptable: boolean) => void;
    updateChassisNo: (itemId: string, chassisNo: string) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    registrationNumber: string;
    setRegistrationNumber: (value: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
    const [registrationNumber, setRegistrationNumber] = React.useState('');
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Ensure no data is persisted or loaded from localStorage
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('plexus_cart');
                localStorage.removeItem('plexus_registration');
            } catch (err) {
                console.error('Failed to clean up localStorage:', err);
            }
        }
        setIsInitialized(true);
    }, []);

    const addToCart = (newItem: CartItem) => {
        setCartItems((prevItems) => {
            // Check if item already exists in the cart
            const existingItem = prevItems.find((item) => item.number === newItem.number && item.vendorNumber === newItem.vendorNumber && item.isAdaptable === newItem.isAdaptable);

            if (existingItem) {
                // Increment quantity
                return prevItems.map((item) =>
                    item.number === newItem.number && item.vendorNumber === newItem.vendorNumber && item.isAdaptable === newItem.isAdaptable
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

    const toggleAdaptable = (itemId: string, isAdaptable: boolean) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, isAdaptable } : item
            )
        );
    };

    const updateChassisNo = (itemId: string, chassisNo: string) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, chassisNo } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        setRegistrationNumber('');
    };

    const totalItems = cartItems.length;

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
                toggleAdaptable,
                updateChassisNo,
                clearCart,
                totalItems,
                totalPrice,
                registrationNumber,
                setRegistrationNumber,
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
