import {Button, Text} from "@chakra-ui/react";
import {useRef} from "react";

interface SwipeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    firstText: string;
    secondText: string;
    firstClass?: string;
    secondClass?: string;
}

export default function SwipeButton({
                                        firstText = "Get access",
                                        secondText = "Get access",
                                        firstClass = "bg-orange-500 text-white",
                                        secondClass = "bg-black text-white",
                                        ...props
                                    }: SwipeButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    return (
        <Button
            {...props}
            ref={buttonRef}
            position="relative"
            overflow="hidden"
            bg="orange.500"
            color="white"
            fontSize="2xl"
            fontWeight="bold"
            borderRadius="md"
            px={4}
            py={2}
            _hover={{bg: "transparent"}}
            className="group"
        >
            {/* Texto inicial */}
            <Text
                className={`absolute inset-0 flex items-center justify-center duration-300 ease-in-out ${firstClass}`}
                transform="translateY(0)"
                transition="transform 0.3s ease-in-out"
                _groupHover={{transform: "translateY(-100%)"}}
            >
                {firstText}
            </Text>

            {/* Texto ao hover */}
            <Text
                className={`absolute inset-0 flex items-center justify-center duration-300 ease-in-out ${secondClass}`}
                transform="translateY(100%)"
                transition="transform 0.3s ease-in-out"
                _groupHover={{transform: "translateY(0)"}}
            >
                {secondText}
            </Text>
        </Button>
    );
}
