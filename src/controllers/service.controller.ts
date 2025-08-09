import { fileURLToPath } from "url";
import { ILogger } from "../logger.js";
import { Service } from "node-windows";
import { existsSync } from "fs";

export class ServiceController {
	private readonly SERVICE_NAME = "night-daemon";
	private readonly SERVICE_DESCRIPTION = "Night daemon service to manage system shutdown during night hours.";
	private readonly SCRIPT_PATH: string;

	private readonly SERVICE: Service

	constructor(private readonly _logger: ILogger) {
  	this.SCRIPT_PATH = fileURLToPath(new URL("../../dist/mainLoop.js", import.meta.url));

		 if (!existsSync(this.SCRIPT_PATH)) {
				this._logger.error(`Script file not found: ${this.SCRIPT_PATH}`);
				this._logger.error("Please make sure to compile TypeScript files first: npm run build");
				throw new Error(`Script file not found: ${this.SCRIPT_PATH}`);
			}

		this.SERVICE = new Service({
			name: this.SERVICE_NAME,
			description: this.SERVICE_DESCRIPTION,
			script: this.SCRIPT_PATH,
			
		});

		this.listenToServiceEvents();
	}

	public installService(): void {
		this.SERVICE.install();
	}

	public uninstallService(): void {
		this.SERVICE.uninstall();
	}

	private startService(): void {
		this.SERVICE.start();
	}

	private listenToServiceEvents(): void {
		this.SERVICE.on("install", () => {
			this._logger.info(`Service ${this.SERVICE_NAME} installed successfully.`);
			this.startService();
		});

		this.SERVICE.on("uninstall", () => {
			this._logger.info(`Service ${this.SERVICE_NAME} uninstalled successfully.`);
		});

		this.SERVICE.on("start", () => {
			this._logger.info(`Service ${this.SERVICE_NAME} started successfully.`);
		});
	}
}