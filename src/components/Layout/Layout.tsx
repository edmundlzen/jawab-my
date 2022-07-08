import Head from 'next/head';
import {AppShell} from "../AppShell";

type LayoutProps = {
	children: React.ReactNode;
	title?: string;
	hideSidebar?: boolean;
}

export default function Layout(props: LayoutProps) {
	const {children, title} = props;

	return (
		<div className={'w-screen'}>
			<Head>
				<title>{title || 'Jawab.my'}</title>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
			</Head>
			<AppShell hideSidebar={!!props.hideSidebar}
			>
				{children}
			</AppShell>
		</div>
	);
}