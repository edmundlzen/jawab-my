const daysAgo = (date: Date) => {
	const diff = Date.now() - date.getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	if (days === 0) {
		return "today";
	} else if (days === 1) {
		return "yesterday";
	} else {
		return `${days} days ago`;
	}
};

export default daysAgo;