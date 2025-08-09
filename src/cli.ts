#!/usr/bin/env node
import yargs from "yargs";
import { ServiceController } from "./controllers/service.controller.js"
import { Logger } from "./logger.js";

const logger = new Logger();
const serviceController = new ServiceController(logger);

const argv = yargs(process.argv.slice(2))
  .command("install", "Install the service")
  .command("uninstall", "Uninstall the service")
  .demandCommand(1)
  .strictCommands()
  .help()
  .parseSync();

const command = argv._[0];

if (command === "install") {
  logger.info("Installing service...");
  serviceController.installService();
} else if (command === "uninstall") {
  logger.info("Uninstalling service...");
  serviceController.uninstallService();
} else {
  console.error("Unknown command");
  process.exit(1);
}
