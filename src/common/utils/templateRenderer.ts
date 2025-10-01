import fs from "fs";
import Handlebars from "handlebars";
import path from "path";

export function renderTemplate(templateFile: string, data: any): string {
	const filePath = path.join(process.cwd(), "src", "templates", templateFile);
	const source = fs.readFileSync(filePath, "utf-8");
	const compiled = Handlebars.compile(source);
	return compiled(data);
}
