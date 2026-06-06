import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Track when request finishes sending response
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // HTTP Method Colors (ANSI Escape Codes)
    let methodColor = "\x1b[37m"; // White default
    if (method === "GET") methodColor = "\x1b[32m"; // Green
    else if (method === "POST") methodColor = "\x1b[33m"; // Yellow
    else if (method === "PUT" || method === "PATCH") methodColor = "\x1b[36m"; // Cyan
    else if (method === "DELETE") methodColor = "\x1b[31m"; // Red

    // Status Code Colors
    let statusColor = "\x1b[32m"; // Green default (2xx)
    if (status >= 300 && status < 400) statusColor = "\x1b[36m"; // Cyan (3xx)
    else if (status >= 400 && status < 500) statusColor = "\x1b[33m"; // Yellow (4xx)
    else if (status >= 500) statusColor = "\x1b[31m"; // Red (5xx)

    const resetColor = "\x1b[0m";

    console.log(
      `[${new Date().toLocaleTimeString()}] ${methodColor}${method}${resetColor} ${originalUrl} - ${statusColor}${status}${resetColor} (${duration}ms)`
    );
  });

  next();
};
