import { Text } from "@mantine/core";

type Status404Props = {
    customMessage?: string;
};

const Status404 = (props: Status404Props) => {
    return (
        <div className={"h-full flex justify-center items-center"}>
            <div className={"text-center"}>
                <Text className={"text-5xl font-bold"}>404</Text>
                <Text className={"text-2xl font-medium mt-2"}>
                    {props.customMessage ||
                        "The requested resource was not found"}
                </Text>
            </div>
        </div>
    );
};

export default Status404;
