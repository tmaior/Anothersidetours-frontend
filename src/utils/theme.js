import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    breakpoints: {
        sm: "30em",  // ~480px
        md: "48em",  // ~768px
        lg: "62em",  // ~992px
        xl: "80em",  // ~1280px
        "2xl": "96em", // ~1536px
        "3xl": "120em", // ~1920px
        "4xl": "160em", // ~2560px
    },
});

export default theme;
