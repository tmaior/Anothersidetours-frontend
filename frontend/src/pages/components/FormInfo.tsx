import { Input, Text, VStack } from "@chakra-ui/react";

export default function FormInfo() {
  return (
    <VStack w={"full"}>
      <Text w={"full"} color={"blue.300"}>CONTACT INFO</Text>
      <VStack w={"full"} mt={"15px"} alignItems="flex-start">
        <Text w={"full"}>Name</Text>
        <Input
          borderRadius={"0px"}
          placeholder={"Full name"}
          maxWidth="600px"
        />
      </VStack>
      <VStack w={"full"} alignItems="flex-start">
        <Text w={"full"}>Email</Text>
        <Input
          borderRadius={"0px"}
          placeholder={"Email address"}
          maxWidth="600px"
        />
      </VStack>
      <VStack w={"full"} alignItems="flex-start">
        <Text w={"full"}>Phone</Text>
        <Input
          borderRadius={"0px"}
          placeholder={"Phone Number"}
          maxWidth="600px"
        />
      </VStack>
    </VStack>
  );
}
