import {Flex} from "@chakra-ui/react";
import PrincipalNavBar from "../components/PrincipalNavBar";
import BodyCards from "../components/BodyCards";


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
