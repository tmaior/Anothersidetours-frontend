import {Badge} from "@chakra-ui/react";
import {CheckCircleIcon, InfoIcon, NotAllowedIcon, WarningIcon} from "@chakra-ui/icons";

const StatusBadge = ({status}) => {
    const renderBadge = () => {
        switch (status) {
            case "ACCEPTED":
                return (
                    <Badge colorScheme="green" mt={2}>
                        <CheckCircleIcon mr={1}/> Confirmed
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge colorScheme="yellow" mt={2}>
                        <InfoIcon mr={1}/> Pending
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge colorScheme="red" mt={2}>
                        <WarningIcon mr={1}/> Rejected
                    </Badge>
                );
            case "CANCELED":
                return (
                    <Badge colorScheme="gray" mt={2}>
                        <NotAllowedIcon mr={1}/> Canceled
                    </Badge>
                );
            default:
                return (
                    <Badge colorScheme="blue" mt={2}>
                        <InfoIcon mr={1}/> Unknown Status
                    </Badge>
                );
        }
    };

    return renderBadge();
};

export default StatusBadge;