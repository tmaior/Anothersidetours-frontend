import React, { useState, useRef, useEffect } from "react";
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

interface GuestLimitsProps {
    perReservationMinValue?: number;
    perReservationMaxValue?: number | null;
    perEventMinValue?: number;
    perEventMaxValue?: number | null;
    notifyTimeValue?: number;
    notifyUnitValue?: string;
    onPerReservationMinChange?: (value: number) => void;
    onPerReservationMaxChange?: (value: number | null) => void;
    onPerEventMinChange?: (value: number) => void;
    onPerEventMaxChange?: (value: number | null) => void;
    onNotifyTimeChange?: (value: number) => void;
    onNotifyUnitChange?: (value: string) => void;
}

const timeUnits = ["minute", "hour", "day"];

const GuestLimits: React.FC<GuestLimitsProps> = ({
    perReservationMinValue = 1,
    perReservationMaxValue = null,
    perEventMinValue = 1,
    perEventMaxValue = null,
    notifyTimeValue = 1,
    notifyUnitValue = "hour",
    onPerReservationMinChange,
    onPerReservationMaxChange,
    onPerEventMinChange,
    onPerEventMaxChange,
    onNotifyTimeChange,
    onNotifyUnitChange,
}) => {
    const [perReservationMin, setPerReservationMin] = useState<number | string>(perReservationMinValue);
    const [perReservationMax, setPerReservationMax] = useState<number | string>(perReservationMaxValue === null ? "no limit" : perReservationMaxValue);

    const [perEventMin, setPerEventMin] = useState<number | string>(perEventMinValue);
    const [perEventMax, setPerEventMax] = useState<number | string>(perEventMaxValue === null ? "no limit" : perEventMaxValue);

    const [notifyTime, setNotifyTime] = useState<number>(notifyTimeValue);
    const [notifyUnit, setNotifyUnit] = useState<string>(notifyUnitValue);

    const [editingField, setEditingField] = useState<string | null>(null);

    const inputRef = useRef<any>(null);
    useOutsideClick({
        ref: inputRef,
        handler: () => setEditingField(null),
    });

    useEffect(() => {
        setPerReservationMin(perReservationMinValue);
        setPerReservationMax(perReservationMaxValue === null ? "no limit" : perReservationMaxValue);
        setPerEventMin(perEventMinValue);
        setPerEventMax(perEventMaxValue === null ? "no limit" : perEventMaxValue);
        setNotifyTime(notifyTimeValue);
        setNotifyUnit(notifyUnitValue);
    }, [perReservationMinValue, perReservationMaxValue, perEventMinValue, perEventMaxValue, notifyTimeValue, notifyUnitValue]);

    const handlePerReservationMinChange = (value: number | string) => {
        setPerReservationMin(value);
        if (onPerReservationMinChange && typeof value === 'number') {
            onPerReservationMinChange(value);
        }
    };

    const handlePerReservationMaxChange = (value: number | string) => {
        setPerReservationMax(value);
        if (onPerReservationMaxChange) {
            if (value === "no limit") {
                onPerReservationMaxChange(null);
            } else if (typeof value === 'number') {
                onPerReservationMaxChange(value);
            }
        }
    };

    const handlePerEventMinChange = (value: number | string) => {
        setPerEventMin(value);
        if (onPerEventMinChange && typeof value === 'number') {
            onPerEventMinChange(value);
        }
    };

    const handlePerEventMaxChange = (value: number | string) => {
        setPerEventMax(value);
        if (onPerEventMaxChange) {
            if (value === "no limit") {
                onPerEventMaxChange(null);
            } else if (typeof value === 'number') {
                onPerEventMaxChange(value);
            }
        }
    };

    const handleNotifyTimeChange = (value: number) => {
        setNotifyTime(value);
        if (onNotifyTimeChange) {
            onNotifyTimeChange(value);
        }
    };

    const handleNotifyUnitChange = (value: string) => {
        setNotifyUnit(value);
        if (onNotifyUnitChange) {
            onNotifyUnitChange(value);
        }
    };

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
                        {renderField("Per Reservation Min", perReservationMin, handlePerReservationMinChange, "perResMin")}

                        <Text>and maximum of</Text>
                        {renderField("Per Reservation Max", perReservationMax, handlePerReservationMaxChange, "perResMax")}

                        <Text>per reservation</Text>
                    </Flex>
                </Box>

                <Box>
                    <Text fontWeight="semibold">Per Event Limit</Text>
                    <Flex align="center" gap={2} mt={2}>
                        <Text>Minimum of</Text>
                        {renderField("Per Event Min", perEventMin, handlePerEventMinChange, "perEvtMin")}

                        <Text>and maximum of</Text>
                        {renderField("Per Event Max", perEventMax, handlePerEventMaxChange, "perEvtMax")}

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
                                        onChange={(e) => handleNotifyTimeChange(Math.max(1, Number(e.target.value)))}
                                        autoFocus
                                    />
                                    <Select
                                        w="100px"
                                        value={notifyUnit}
                                        onChange={(e) => handleNotifyUnitChange(e.target.value)}
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
