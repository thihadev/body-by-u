import { isAxiosError } from "axios";

export function getToastErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === "object") {
      if ("errors" in data && data.errors && typeof data.errors === "object") {
        for (const value of Object.values(data.errors)) {
          const messages = Array.isArray(value) ? value : [value];
          const firstError = messages.find(
            (message): message is string => typeof message === "string",
          );
          if (firstError) return firstError;
        }
      }

      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
