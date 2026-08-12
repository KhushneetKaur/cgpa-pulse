import winston from "winston";

winston.addColors({
  error: "red",
  warn:  "yellow",
  info:  "green",
  http:  "magenta",
  debug: "white",
});

const isDev = process.env.NODE_ENV === "development";
 
const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.errors({ stack: true }), 
  winston.format.printf(({ timestamp, level, message }) =>
    `${timestamp} [${level}]: ${message}` 
  )
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level:  isDev ? "debug" : "http",
  levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
  format: isDev ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
  ],
});