import React, { useState, useRef } from "react";
import {
    Box,
    Text,
    Flex,
    Button,
    Stack,
    Input,
    Select,
    useOutsideClick,
} from "@chakra-ui/react";

interface GuestLimitsProps {}

const timeUnits = ["minute", "hour", "day"];

const GuestLimits: React.FC<GuestLimitsProps> = () => {
    const [perReservationMin, setPerReservationMin] = useState<number | string>(1);
    const [perReservationMax, setPerReservationMax] = useState<number | string>("no limit");

    const [perEventMin, setPerEventMin] = useState<number | string>(1);
    const [perEventMax, setPerEventMax] = useState<number | string>("no limit");

    const [notifyTime, setNotifyTime] = useState<number>(1);
    const [notifyUnit, setNotifyUnit] = useState<string>("hour");

    const [editingField, setEditingField] = useState<string | null>(null);

    const inputRef = useRef<any>(null);
    useOutsideClick({
        ref: inputRef,
        handler: () => setEditingField(null),
    });

    const renderField = (
        label: string,
        value: number | string,
        onChange: (v: number | string) => void,
        fieldKey: string
    ) => {
        return editingField === fieldKey ? (
            <Box ref={inputRef}>
                <Input
                    w="60px"
                    type="number"
                    value={value === "no limit" ? 0 : value}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        onChange(val < 1 ? "no limit" : val);
                    }}
                    onBlur={() => setEditingField(null)}
                    autoFocus
                />
            </Box>
        ) : (
            <Button
                variant="link"
                onClick={() => setEditingField(fieldKey)}
            >
                <u>{value} guest</u>
            </Button>
        );
    };

    return (
        <Box p={5} borderWidth="1px" borderRadius="lg">
            <Text fontWeight="bold" mb={2}>
                Guest Limits
            </Text>
            <Text fontSize="sm" mb={4}>
                Set min and max limits to how many guests may book.
            </Text>

            <Stack spacing={4}>
                <Box>
                    <Text fontWeight="semibold">Per Reservation Limit</Text>
                    <Flex align="center" gap={2} mt={2}>
                        <Text>Minimum of</Text>
                        {renderField("Per Reservation Min", perReservationMin, setPerReservationMin, "perResMin")}

                        <Text>and maximum of</Text>
                        {renderField("Per Reservation Max", perReservationMax, setPerReservationMax, "perResMax")}

                        <Text>per reservation</Text>
                    </Flex>
                </Box>

                <Box>
                    <Text fontWeight="semibold">Per Event Limit</Text>
                    <Flex align="center" gap={2} mt={2}>
                        <Text>Minimum of</Text>
                        {renderField("Per Event Min", perEventMin, setPerEventMin, "perEvtMin")}

                        <Text>and maximum of</Text>
                        {renderField("Per Event Max", perEventMax, setPerEventMax, "perEvtMax")}

                        <Text>per event</Text>
                    </Flex>
                </Box>

                <Box>
                    <Flex align="center" gap={2} mt={2}>
                        <Text>Notify staff</Text>
                        {editingField === "notify" ? (
                            <Box ref={inputRef}>
                                <Flex align="center" gap={2}>
                                    <Input
                                        w="60px"
                                        type="number"
                                        min={1}
                                        value={notifyTime}
                                        onChange={(e) => setNotifyTime(Math.max(1, Number(e.target.value)))}
                                        autoFocus
                                    />
                                    <Select
                                        w="100px"
                                        value={notifyUnit}
                                        onChange={(e) => setNotifyUnit(e.target.value)}
                                    >
                                        {timeUnits.map((unit) => (
                                            <option key={unit} value={unit}>
                                                {unit}
                                            </option>
                                        ))}
                                    </Select>
                                    <Button size="sm" onClick={() => setEditingField(null)}>
                                        Apply
                                    </Button>
                                </Flex>
                            </Box>
                        ) : (
                            <Button
                                variant="link"
                                onClick={() => setEditingField("notify")}
                            >
                                <u>{notifyTime} {notifyUnit}</u>
                            </Button>
                        )}
                        <Text>
                            prior to start time if the per event minimum has not been met
                        </Text>
                    </Flex>
                </Box>
            </Stack>
        </Box>
    );
};

export default GuestLimits;
