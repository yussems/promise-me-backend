import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { renderTemplate } from "./templateRenderer";

export async function generatePdf(templateFile: string, data: any, outputPath: string) {
	// Şablonu doldur
	const html = renderTemplate(templateFile, data);

	// Chromium başlat
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	// HTML içeriğini yükle
	await page.setContent(html, { waitUntil: "networkidle0" });

	// PDF oluştur
	await page.pdf({
		path: outputPath,
		format: "A4",
		printBackground: true,
	});

	await browser.close();

	return outputPath;
}
