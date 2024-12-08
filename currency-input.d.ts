declare module "react-currency-input-field" {
    import { ComponentType } from "react";
    import {ComponentWithAs} from "@chakra-ui/react";

    export interface CurrencyInputProps {
        value?: string | number;
        decimalsLimit?: number;
        prefix?: string;
        placeholder?: string;
        className?: string;
        bg?: string;
        color?: string;
        customInput: ComponentWithAs<"input", InputProps>;
        onValueChange?: (value?: string, name?: string) => void;

    }

    const CurrencyInput: ComponentType<CurrencyInputProps>;
    export default CurrencyInput;
}
