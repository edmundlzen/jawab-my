// RichText.tsx in your components folder
import { Editor, RichTextEditorProps } from "@mantine/rte";
import dynamic from "next/dynamic";
import { Ref } from "react";

// export default dynamic(() => import("@mantine/rte"), {
//     // Disable during server side rendering
//     ssr: false,

//     // Render anything as fallback on server, e.g. loader or html content without editor
//     loading: () => null,
// });

export default dynamic(
	async () => {
		const { default: RQ } = await import("@mantine/rte");

		const RichTextEditor = ({
									editorRef,
									...props
								}: RichTextEditorProps & { editorRef: Ref<Editor> }) => (
			<RQ
				ref={editorRef}
				{...props}
				controls={[
					["bold", "italic", "underline", "link", "image"],
					// ["h1", "h2", "h3", "h4", "h5", "h6"],
					["unorderedList", "orderedList"],
					["alignLeft", "alignCenter", "alignRight"],
					// ["sup", "sub"],
				]}
			/>
		);
		return RichTextEditor;
	},
	{
		ssr: false,
	}
);
