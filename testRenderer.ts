import { renderTemplate } from "./src/common/utils/templateRenderer";

const html = renderTemplate("simple.html", {
	title: "Test Agreement",
	description: "This is a test agreement between parties.",
	participants: [
		{ side: { title: "Ahmet" }, status: "accepted" },
		{ side: { title: "Mehmet" }, status: "pending" },
	],
	conditions: [{ title: "Condition A", description: "Do something important." }],
	startAt: "2025-10-01",
	dueAt: "2025-10-31",
});

console.log(html);
