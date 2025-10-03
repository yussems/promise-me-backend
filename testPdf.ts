import { generatePdf } from "./src/common/utils/pdfGenarator";

async function main() {
	const pdfPath = await generatePdf(
		"rome.html", // src/templates/rome.html
		{
			title: "SPQR",
			description: "Decree of the Senate",
			participants: [
				{ side: { title: "Marcus Aurelius" }, status: "accepted" },
				{ side: { title: "Gaius Cassius" }, status: "accepted" },
			],
			conditions: [
				{
					title: "I.",
					description:
						"Both parties shall maintain unwavering loyalty to the Republic of Rome until the Kalends of November.",
				},
				{ title: "II.", description: "No legion shall march beyond the sacred Tiber River without Senate approval." },
				{
					title: "III.",
					description:
						"All tributes and taxes shall be paid in full before the Ides of October, with penalties for delay.",
				},
				{
					title: "IV.",
					description:
						"Any disputes shall be resolved by the Praetor Urbanus under Roman law, with decisions binding upon all parties.",
				},
				{
					title: "V.",
					description:
						"This decree shall be inscribed in bronze and displayed in the Forum Romanum for all citizens to witness.",
				},
				{
					title: "VI.",
					description:
						"All military commanders shall submit monthly reports of expenditures and movements to the Senate.",
				},
				{
					title: "VII.",
					description:
						"In case of external threats, all signatories shall immediately mobilize forces and coordinate defense strategies.",
				},
				{
					title: "VIII.",
					description:
						"All religious ceremonies shall be conducted according to Roman tradition, under the Pontifex Maximus.",
				},
				{
					title: "IX.",
					description:
						"This agreement shall be renewed annually on the Kalends of January, requiring full recommitment by all parties.",
				},
				{
					title: "X.",
					description:
						"Violation of any term shall result in expulsion from the Senate, loss of citizenship, and confiscation of property.",
				},
			],
			startAt: "2025-10-01",
			dueAt: "2025-10-31",
		},
		"output.pdf",
	);

	console.log("✅ PDF created at:", pdfPath);
}

main();
