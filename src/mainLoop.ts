 import { readFile } from "fs/promises";

import { Logger } from "./logger.js";
import { HourController } from "./controllers/hour.controller.js";
import { ShutdownConfig } from "./types/types.js";

const logger = new Logger();

async function main() {
  while (true) {
    try {
			logger.info("Starting Night Daemon main Loop...");

			const configRaw = await readFile(new URL("../config.json", import.meta.url), {
				encoding: "utf-8",
			});
			const config: ShutdownConfig = JSON.parse(configRaw);

			logger.info("Shutdown configuration loaded successfully.");
			
  		const hourController = new HourController(config, logger);

      await new Promise(resolve => setTimeout(resolve, 60 * 1000)); // 1 minute delay
      await hourController.shutdown();
    } catch (e) {
      logger.error(String(e));
    }
  }
}

main();