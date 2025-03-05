import {createContext, useContext, useState, useEffect} from 'react';

interface Tour {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    valuePerGuest?: number;
    description?: string;
}

interface CartContextType {
    cart: Tour[];
    setCart: React.Dispatch<React.SetStateAction<Tour[]>>;
    addToCart: (tour: Tour) => void;
    removeFromCart: (index: number) => void;
    resetCart: () => void;
    newCart: (tour: Tour) => void;
    clearCart: () => void;
    setNavigationSource: (source: string) => void;
    navigationSource: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({children}) => {
    const [cart, setCart] = useState<Tour[]>(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        }
        return [];
    });
    
    const [navigationSource, setNavigationSource] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('navigationSource') || '';
        }
        return '';
    });
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart]);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('navigationSource', navigationSource);
        }
    }, [navigationSource]);
    const addToCart = (tour: Tour) => {
        setCart(prevCart => [...prevCart, tour]);
    };
    const removeFromCart = (index: number) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            newCart.splice(index, 1);
            return newCart;
        });
    };
    const newCart = (tour: Tour) => {
        setCart([tour]);
    };
    const resetCart = () => {
        if (navigationSource !== 'make-a-purchase') {
            setCart([]);
        }
    };
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{
            cart, 
            setCart, 
            addToCart,
            removeFromCart,
            newCart, 
            resetCart, 
            clearCart,
            navigationSource,
            setNavigationSource
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};