import {createContext, useContext, useState, useEffect} from 'react';
import axios from 'axios';
import { parseCookies, setCookie, destroyCookie } from 'nookies';

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
    isAuthenticated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const saveCartToCookie = (cart: Tour[]) => {
    setCookie(null, 'tour_cart', JSON.stringify(cart), {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
    });
};

const getCartFromCookie = () => {
    const cookies = parseCookies();
    return cookies.tour_cart ? JSON.parse(cookies.tour_cart) : [];
};

const clearCartCookie = () => {
    destroyCookie(null, 'tour_cart', { path: '/' });
};

export const CartProvider = ({children}) => {
    const [cart, setCart] = useState<Tour[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    
    const [navigationSource, setNavigationSource] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const cookies = parseCookies();
            return cookies.navigationSource || '';
        }
        return '';
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                    withCredentials: true
                });
                
                setIsAuthenticated(true);
                
                const savedCart = getCartFromCookie();
                setCart(savedCart);
            } catch (error) {
                setIsAuthenticated(false);
                setCart([]);
                clearCartCookie();
            }
        };
        
        checkAuth();
    }, []);

    useEffect(() => {
        if (isAuthenticated && cart.length > 0) {
            saveCartToCookie(cart);
        }
    }, [cart, isAuthenticated]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCookie(null, 'navigationSource', navigationSource, {
                maxAge: 30 * 24 * 60 * 60,
                path: '/',
            });
        }
    }, [navigationSource]);

    const addToCart = (tour: Tour) => {
        if (!isAuthenticated) return;
        
        setCart(prevCart => {
            const newCart = [...prevCart, tour];
            saveCartToCookie(newCart);
            return newCart;
        });
    };

    const removeFromCart = (index: number) => {
        if (!isAuthenticated) return;
        
        setCart(prevCart => {
            const newCart = [...prevCart];
            newCart.splice(index, 1);
            saveCartToCookie(newCart);
            return newCart;
        });
    };

    const newCart = (tour: Tour) => {
        if (!isAuthenticated) return;
        
        const newCartData = [tour];
        setCart(newCartData);
        saveCartToCookie(newCartData);
    };

    const resetCart = () => {
        if (!isAuthenticated) return;
        
        if (navigationSource !== 'make-a-purchase') {
            setCart([]);
            clearCartCookie();
        }
    };

    const clearCart = () => {
        setCart([]);
        clearCartCookie();
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
            setNavigationSource,
            isAuthenticated
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