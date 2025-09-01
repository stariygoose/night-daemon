import { ILogger } from "../logger.js";
import axios from "axios";
import { Day, Hour, ShutdownConfig, TimeApiResponse } from "../types/types.js";
import { exec } from "child_process";

export class HourController {
  private readonly region = "Europe/Paris";
  constructor(
    private readonly shutdownInfo: ShutdownConfig,
    private readonly _logger: ILogger,
  ) {}

  public async shutdown(): Promise<void> {
    const shouldShutdown = await this.shouldShutdown();
    switch (shouldShutdown) {
      case true:
        this._logger.info("Shutting down the system due to night hours.");
        exec("shutdown /s /t 0", (error, stdout, stderr) => {
          if (error) {
            this._logger.error(`Error during shutdown: ${error.message}`);
            return;
          }
        });
        break;
      case false:
        this._logger.info(
          "Shutdown skipped: current time is within allowed hours.",
        );
        break;
      default:
        this._logger.error(
          "An error occurred while checking shutdown conditions. Switch is in default case (unpossibly)",
        );
        break;
    }
  }

  private async shouldShutdown(): Promise<boolean> {
    const today = await this.getCurrentTime(this.region);
    if (!today) {
      this._logger.error("Failed to retrieve current time data.");
      return false;
    }
    const { dayOfWeek, dateTime } = today;
    const currentHour = new Date(dateTime).getHours();

    return this.isNightTime(dayOfWeek, currentHour);
  }

  private isNightTime(day: Day, hour: Hour): boolean {
    const interval =
      day === "Saturday" || day === "Friday"
        ? this.shutdownInfo.weekends
        : this.shutdownInfo.weekdays;

    const { nightStartHour, nightEndHour } = interval;

    if (nightStartHour > nightEndHour) {
      return hour >= nightStartHour || hour < nightEndHour;
    } else {
      return hour >= nightStartHour && hour < nightEndHour;
    }
  }

  private async getCurrentTime(
    region: string,
  ): Promise<TimeApiResponse | null> {
    try {
      const response = await axios.get<TimeApiResponse>(
        `https://timeapi.io/api/Time/current/zone?timeZone=${region}`,
      );
      return response.data;
    } catch (e: any) {
      this._logger.error(
        `Failed to fetch time data from TimeAPI: ${e.message}`,
      );

      try {
        const now = new Date();
        const fallbackResponse: TimeApiResponse = {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
          hour: now.getHours(),
          minute: now.getMinutes(),
          seconds: now.getSeconds(),
          milliSeconds: now.getMilliseconds(),
          dateTime: now.toISOString(),
          date: now.toLocaleDateString("en-US"),
          time: now.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          }),
          timeZone: "Europe/Paris",
          dayOfWeek: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ][now.getDay()] as Day,
          dstActive: false,
        };

        this._logger.warn("Using local time as fallback");
        return fallbackResponse;
      } catch (fallbackError) {
        this._logger.error(`Fallback time generation failed: ${fallbackError}`);
        return null;
      }
    }
  }
}

