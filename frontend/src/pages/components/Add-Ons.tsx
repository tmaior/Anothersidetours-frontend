import {useState} from "react";
import PickupSpinner from "@/pages/components/PickupSpinner";
import {Box, Flex} from "@chakra-ui/react";
import CustomCheckbox from "@/pages/components/CustomCheckbox";

export default function AddOns() {

    const [quantity, setQuantity] = useState(0);
    const [isTourProtectionChecked, setIsTourProtectionChecked] = useState(false);

    return (

        <Flex direction="column" width="100%" p={4}>
            <PickupSpinner
                title="ADD ONS"
                description="Add Additional Tour Time Per Hour"
                minValue={0}
                value={quantity}
                onChange={setQuantity}
                note="If you would like to add additional time to your tour, please select how many hours you would like to add here. The charge is $150 per additional hour"
                pl={95}
            />

            <Box mt={4} pl={95}>
                <CustomCheckbox
                    title="Tour Protection"
                    description="Tour Protection allows you to cancel or reschedule any time up to 3 hours prior. You will be reimbursed in full, less this fee."
                    isChecked={isTourProtectionChecked}
                    onChange={setIsTourProtectionChecked}
                />
            </Box>
        </Flex>
    );
}
