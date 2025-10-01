import { generatePdf } from "./src/common/utils/pdfGenarator";

async function main() {
	const pdfPath = await generatePdf(
		"simple.html", // src/templates/simple.html dosyan
		{
			title: "Deneme Sözleşmesi",
			description: "Bu sözleşme Ahmet ile Mehmet arasında yapılmıştır.",
			participants: [
				{ side: { title: "Ahmet" }, status: "accepted" },
				{ side: { title: "Mehmet" }, status: "pending" },
			],
			conditions: [{ title: "Şart 1", description: "Taraflar ay sonuna kadar projeyi bitirecek." }],
			startAt: "2025-10-01",
			dueAt: "2025-10-31",
		},
		"output.pdf", // çıktının kaydedileceği dosya
	);

	console.log("✅ PDF created at:", pdfPath);
}

main();
