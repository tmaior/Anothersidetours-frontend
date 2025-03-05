import {createContext, useContext, useState} from 'react';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({children}) => {
    const [cart, setCart] = useState<Tour[]>([]);
    return (
        <CartContext.Provider value={{cart, setCart}}>
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