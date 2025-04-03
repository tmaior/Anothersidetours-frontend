import {
  Box,
  Text,
  Flex,
  RadioGroup,
  Radio,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Code,
} from "@chakra-ui/react";
import { useState } from "react";

const ButtonCode = () => {
  const [checkoutType, setCheckoutType] = useState("popup");
  const [designOption, setDesignOption] = useState("default");

  return (
    <Box p={6}>
      {/* Step 1 */}
      <StepBox
        step={1}
        title="Paste this code into your site’s header or footer"
      >
        <Code
          display="block"
          whiteSpace="pre-wrap"
          p={3}
          bg="gray.100"
          borderRadius="md"
        >
          {`<script type="text/javascript">
  (function() {
    var co = document.createElement("script");
    co.type = "text/javascript"; co.async = true;
    co.src = "https://xola.com/checkout.js";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(co, s);
  })();
</script>`}
        </Code>
      </StepBox>

      {/* Step 2 */}
      <StepBox step={2} title="Choose your checkout type">
        <RadioGroup onChange={setCheckoutType} value={checkoutType}>
          <Stack spacing={3} direction="row">
            <Radio value="popup">Pop up</Radio>
            <Radio value="embedded">Embedded</Radio>
            <Radio value="url">URL</Radio>
          </Stack>
        </RadioGroup>
      </StepBox>

      {/* Step 3 */}
      <StepBox step={3} title="Choose your design">
        <Flex justify="space-between" align="center" width="100%">
          <RadioGroup onChange={setDesignOption} value={designOption}>
            <Stack spacing={3} direction="row">
              <Radio value="default">Default</Radio>
              <Radio value="custom">Custom</Radio>
            </Stack>
          </RadioGroup>
          <Flex gap={2}>
            <Button colorScheme="blue" leftIcon={<span>＋</span>}>
              Book Now
            </Button>
            <Button colorScheme="blue" leftIcon={<span>🎁</span>}>
              Buy Gift
            </Button>
          </Flex>
        </Flex>
      </StepBox>

      {/* Step 4 - Tabs (só a estrutura inicial) */}
      <StepBox step={4} title="Copy + Paste button code">
        <Tabs isFitted variant="enclosed">
          <TabList>
            <Tab>Single Item Checkout</Tab>
            <Tab>Multiple Item Checkout</Tab>
            <Tab>Timeline</Tab>
            <Tab>Gifts</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Text>
                Options and generated code for single item checkout...
              </Text>
            </TabPanel>
            <TabPanel>
              <Text>Multiple item logic here...</Text>
            </TabPanel>
            <TabPanel>
              <Text>Timeline logic here...</Text>
            </TabPanel>
            <TabPanel>
              <Text>Gift options here...</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </StepBox>
    </Box>
  );
};

// Component to render the step box with number and title
const StepBox = ({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) => (
  <Box borderWidth="1px" borderRadius="md" p={5} mb={6}>
    <Flex alignItems="center" mb={3}>
      <Box
        fontSize="md"
        fontWeight="bold"
        backgroundColor="gray.200"
        width="32px"
        height="32px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="full"
        mr={3}
      >
        {step}
      </Box>
      <Text fontWeight="bold">{title}</Text>
    </Flex>
    {children}
  </Box>
);

export default ButtonCode;
