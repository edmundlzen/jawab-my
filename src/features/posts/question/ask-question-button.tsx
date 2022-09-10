import {Button, Text} from "@/components/ui/core";
import {showNotification} from "@mantine/notifications";
import {useRouter} from "next/router";
import {useSession} from "next-auth/react";

const AskQuestionButton = () => {
	const router = useRouter();
	const { data: session, status } = useSession();

	return <Button
		className={"bg-teal-400 mr-4"}
		color={"teal"}
		onClick={async () => {
			if (status !== "authenticated") {
				showNotification({
					title: "Please log in",
					message:
						"You must be logged in to ask a question",
				});
				return;
			}
			await router.push("/ask");
		}}
	>
		<Text className={"text-sm"}>Ask question</Text>
	</Button>;
}

export default AskQuestionButton;