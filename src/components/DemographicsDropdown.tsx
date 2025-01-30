import React, {useEffect, useState} from "react";
import {
    Button,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Radio,
    RadioGroup,
    Stack,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import {useGuest} from "./GuestContext";

const DemographicsDropdown = ({onSelect}) => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [demographics, setDemographics] = useState([]);
    const [selectedDemographic, setSelectedDemographic] = useState("");
    const {tenantId} = useGuest();

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/demographics/tenant/${tenantId}`)
            .then((res) => res.json())
            .then((data) => setDemographics(data))
            .catch((err) => console.error("Error fetching demographics:", err));
    }, []);

    const handleSelect = (selectedDemographic) => {
        onSelect(selectedDemographic);
        onClose();
    };

    return (
        <Popover isOpen={isOpen} onClose={onClose} placement="bottom-start">
            <PopoverTrigger>
                <Button onClick={onOpen} colorScheme="gray" variant="outline">
                    + Add Demographic
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow/>
                <PopoverBody>
                    <VStack align="stretch">
                        <RadioGroup onChange={handleSelect}>
                            <Stack direction="column" maxH="200px" overflowY="auto">
                                {demographics.map((demo) => (
                                    <Radio key={demo.id} value={demo.name}>
                                        {demo.name}
                                    </Radio>
                                ))}
                            </Stack>
                        </RadioGroup>
                        <Button colorScheme="gray" variant="outline" onClick={() => alert("TODO: Open Create Modal")}>
                            + Create Demographic
                        </Button>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default DemographicsDropdown;
