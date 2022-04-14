import { SfdxCommand } from "@salesforce/command";
import Splitter from "./splitters/Splitter";
import {
	findAllFilesWithExtension,
	getDefaultFolder,
} from "./utils/filesUtils";
import { rmSync } from "fs";

export default abstract class SplittingCommand extends SfdxCommand {
	protected abstract getSplitter(): Splitter;

	async run() {
		const filesToSplit = await this.getFilesToSplit();
		const splitter = this.getSplitter();

		this.ux.startSpinner(this.getSpinnerText());
		for (const file of filesToSplit) {
			this.ux.setSpinnerStatus(file);
			await splitter.split(file);
			if (this.deleteAfterSplitting()) {
				rmSync(file);
			}
			this.ux.log(file);
		}

		this.ux.stopSpinner(this.getDoneMessage());
	}

	private async getFilesToSplit(): Promise<string[]> {
		if (this.flags["input"]) {
			return this.flags["input"].split(",").map((file) => file.trim());
		}
		return findAllFilesWithExtension(
			getDefaultFolder(this.project),
			this.getFilesExtension()
		);
	}

	protected abstract getFilesExtension(): string;

	protected abstract getDoneMessage(): string;

	protected abstract getSpinnerText(): string;

	protected deleteAfterSplitting(): Boolean {
		return this.flags.remove;
	}
}