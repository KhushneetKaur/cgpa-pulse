import winston from "winston";
import path    from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const levels = {
  error: 0,
  warn:  1,
  info:  2,
  http:  3,
  debug: 4,
};

const colors = {
  error: "red",
  warn:  "yellow",
  info:  "green",
  http:  "magenta",
  debug: "white",
};

winston.addColors(colors);

const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
  )
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const isDev = process.env.NODE_ENV === "development";

export const logger = winston.createLogger({
  level:      isDev ? "debug" : "http",
  levels,
  format:     isDev ? devFormat : prodFormat,
  transports: [
    // Always log to console
    new winston.transports.Console(),

    // In production, also write to files
    ...(!isDev
      ? [
          new winston.transports.File({
            filename: path.join(__dirname, "../../../logs/error.log"),
            level:    "error",
          }),
          new winston.transports.File({
            filename: path.join(__dirname, "../../../logs/combined.log"),
          }),
        ]
      : []),
  ],
});