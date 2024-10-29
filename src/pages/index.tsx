import PrincipalNavBar from "@/pages/components/PrincipalNavBar";
import BodyCards from "@/pages/components/BodyCards";
import {Flex} from "@chakra-ui/react";


export default function Home() {
    return (
        <Flex w={"100%"} flexDir={"column"} justify={"center"} align={"center"}>

            <PrincipalNavBar/>
            <Flex w={"100%"} maxW={"1300px"}>
                <BodyCards/>
            </Flex>

        </Flex>


    );
}
