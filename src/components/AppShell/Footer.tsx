import { Text } from "@/components/ui/core";

type FooterProps = {};

export default function Footer(props: FooterProps) {
    return (
        <div
            className={
                "h-48 w-full bg-gray-100 flex justify-center items-center flex-col"
            }
        >
            <Text className={'text-red-600 font-["Oswald"] text-2xl'}>
                Jawab.my
            </Text>
            <Text className={'text-yellow-500 font-["Oswald"] text-xl'}>
                Under Construction
            </Text>
        </div>
    );
}
