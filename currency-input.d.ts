declare module "react-currency-input-field" {
    import { ComponentType } from "react";
    import {ComponentWithAs, InputProps} from "@chakra-ui/react";

    export interface CurrencyInputProps {
        value?: string | number;
        decimalsLimit?: number;
        prefix?: string;
        allowNegative?: boolean;
        placeholder?: string;
        className?: string;
        bg: string;
        color: string;
        borderColor: string;
        customInput: ComponentWithAs<"input", InputProps>;
        onValueChange?: (value?: string, name?: string) => void;
    }

    const CurrencyInput: ComponentType<CurrencyInputProps>;
    export default CurrencyInput;
}
