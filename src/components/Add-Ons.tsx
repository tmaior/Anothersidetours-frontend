import { Box, Flex, Text } from "@chakra-ui/react";
import PickupSpinner from "./PickupSpinner";
import CustomCheckbox from "./CustomCheckbox";
import {useGuest} from "./GuestContext";
import {useEffect, useState} from "react";

interface AddOnProps {
    addons: Array<{ id: string; label: string; type: string; description: string ; price: number}>;
}

export default function AddOns({ addons }: AddOnProps) {
    const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
    const [checkedAddons, setCheckedAddons] = useState<{ [id: string]: boolean }>({});
    const { setDetailedAddons } = useGuest();

    const handleQuantityChange = (id: string, value: number) => {
        setQuantities((prev) => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id: string, isChecked: boolean) => {
        setCheckedAddons((prev) => ({ ...prev, [id]: isChecked }));
    };

    useEffect(() => {
        const detailedAddons = (addons || []).map((addon) => {
            if (addon.type === "SELECT" && (quantities[addon.id] || 0) > 0) {
                return {
                    id: addon.id,
                    label: addon.label,
                    type: addon.type,
                    quantity: quantities[addon.id],
                    price: addon.price,
                    total: quantities[addon.id] * (addon.price ?? 0),
                };
            } else if (addon.type === "CHECKBOX" && checkedAddons[addon.id]) {
                return {
                    id: addon.id,
                    label: addon.label,
                    type: addon.type,
                    quantity: 1,
                    price: addon.price,
                    total: addon.price ?? 0,
                };
            }
            return null;
        }).filter(Boolean);

        setDetailedAddons(detailedAddons);
    }, [addons, quantities, checkedAddons, setDetailedAddons]);

    const selectAddons = (addons || []).filter((addon) => addon.type === "SELECT");
    const checkboxAddons = (addons || []).filter((addon) => addon.type === "CHECKBOX");

    return (
        <Flex direction="column" width="100%" p={4} marginTop={"-120px"}>
            <Text w={"full"} color={"blue.300"}>ADD ONS</Text>

            {selectAddons.map((addon) => (
                <PickupSpinner
                    key={addon.id}
                    title={addon.label}
                    minValue={0}
                    value={quantities[addon.id] || 0}
                    onChange={(value) => handleQuantityChange(addon.id, value)}
                    note={addon.description}
                    pl={95}
                />
            ))}

            {checkboxAddons.map((addon) => (
                <Box key={addon.id} mt={4} pl={95}>
                    <CustomCheckbox
                        title={addon.label}
                        description={addon.description}
                        isChecked={checkedAddons[addon.id] || false}
                        onChange={(isChecked) => handleCheckboxChange(addon.id, isChecked)}
                    />
                </Box>
            ))}
        </Flex>
    );
}
