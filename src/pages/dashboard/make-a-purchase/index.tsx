import {useState} from 'react'
import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Select,
    Switch,
    Text,
} from '@chakra-ui/react'
import DashboardLayout from "../../../components/DashboardLayout";

const PurchasePage = () => {
    const [quantity, setQuantity] = useState(2)
    const [date, setDate] = useState('2024-12-20')
    const [time, setTime] = useState('08:00')
    const [pickUpAddOn, setPickUpAddOn] = useState(0)
    const [privateTourAddOn, setPrivateTourAddOn] = useState(0)
    const [bookingFeePercent, setBookingFeePercent] = useState(0)
    const [gratuity, setGratuity] = useState('')

    const basePricePerGuest = 149
    const totalBase = quantity * basePricePerGuest
    const totalAddOns = pickUpAddOn * 50 + privateTourAddOn * 50
    const gratuityAmount = gratuity !== '' ? parseFloat(gratuity) : 0
    const grandTotal = totalBase + totalAddOns + gratuityAmount

    const [bookingFee, setBookingFee] = useState(false) // agora um boolean

    const feeAmount = bookingFee ? totalBase * 0.06 : 0

    return (
        <DashboardLayout>
            <Box p={8}>
                <Breadcrumb mb={4}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="#">Purchases</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href="#">Make a Purchase</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <Heading size="lg" mb={6}>Make a Purchase</Heading>

                <Flex direction={{base: 'column', md: 'row'}} gap={8}>
                    <Box flex="1" bg="gray.50" p={6} borderRadius="md" boxShadow="sm">
                        <FormControl mb={4}>
                            <FormLabel>Quantity</FormLabel>
                            <HStack>
                                <Button
                                    onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                                    variant="outline"
                                >
                                    -
                                </Button>
                                <Text>{quantity}</Text>
                                <Button
                                    onClick={() => setQuantity(quantity + 1)}
                                    variant="outline"
                                >
                                    +
                                </Button>
                                <Text>Guests</Text>
                            </HStack>
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel>Time</FormLabel>
                            <Select value={time} onChange={(e) => setTime(e.target.value)}>
                                <option value="08:00">8:00 AM</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                            </Select>
                        </FormControl>

                        <Heading size="md" mt={8} mb={4}>Add-ons</Heading>

                        <HStack justify="space-between" mb={4}>
                            <Text>Add A Pick-Up and Drop Off for The Hike? (US$50,00)</Text>
                            <HStack>
                                <Button
                                    variant="outline"
                                    onClick={() => setPickUpAddOn(pickUpAddOn > 0 ? pickUpAddOn - 1 : 0)}
                                >
                                    -
                                </Button>
                                <Text>{pickUpAddOn}</Text>
                                <Button
                                    variant="outline"
                                    onClick={() => setPickUpAddOn(pickUpAddOn + 1)}
                                >
                                    +
                                </Button>
                            </HStack>
                        </HStack>

                        <HStack justify="space-between" mb={4}>
                            <Text>Private Tour? (US$50,00)</Text>
                            <HStack>
                                <Button
                                    variant="outline"
                                    onClick={() => setPrivateTourAddOn(privateTourAddOn > 0 ? privateTourAddOn - 1 : 0)}
                                >
                                    -
                                </Button>
                                <Text>{privateTourAddOn}</Text>
                                <Button
                                    variant="outline"
                                    onClick={() => setPrivateTourAddOn(privateTourAddOn + 1)}
                                >
                                    +
                                </Button>
                            </HStack>
                        </HStack>

                        <FormControl display="flex" alignItems="center" mb={4}>
                            <Text mr={4}>6% Booking Fee</Text>
                            <Switch
                                isChecked={bookingFee}
                                onChange={(e) => setBookingFee(e.target.checked)}
                                colorScheme="blue"
                            />
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel>Gratuity (opcional)</FormLabel>
                            <Select placeholder="Select tip amount" value={gratuity}
                                    onChange={(e) => setGratuity(e.target.value)}>
                                <option value="0">0%</option>
                                <option value={(totalBase * 0.10).toFixed(2)}>10%</option>
                                <option value={(totalBase * 0.15).toFixed(2)}>15%</option>
                                <option value={(totalBase * 0.20).toFixed(2)}>20%</option>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box w={{base: "100%", md: "400px"}} bg="white" p={6} borderRadius="md" boxShadow="sm">
                        <Heading size="md" mb={4}>Purchase Summary</Heading>
                        <Box bg="blue.50" p={4} borderRadius="md" mb={4}>
                            <Text fontWeight="bold">Beyond The Billboards: Hollywood Sign Hike</Text>
                            <Text fontSize="sm">{date} - {time}</Text>
                            <Text mt={2}>Guests ({quantity} × US$149.00) = US${totalBase.toFixed(2)}</Text>
                        </Box>

                        <Divider mb={4}/>

                        <Text fontWeight="bold" mb={2}>Grand Total</Text>
                        <Text fontSize="xl" mb={4}>US${grandTotal.toFixed(2)}</Text>

                        <FormControl mb={4}>
                            <FormLabel>Code</FormLabel>
                            <HStack>
                                <Input placeholder="Enter code"/>
                                <Button>Apply Code</Button>
                            </HStack>
                        </FormControl>
                        <Button colorScheme="blue" width="100%">Make a Purchase</Button>
                    </Box>
                </Flex>
            </Box>
        </DashboardLayout>
    )
}

export default PurchasePage