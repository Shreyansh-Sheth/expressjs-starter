const errorMessages = {
  NOT_FOUND: {
    message: "Not found",
    status: 404,
    isPublic: true,
  },
  INVALID_REQUEST: {
    message: "Invalid request",
    status: 400,
    isPublic: true,
  },
};
type constructorParams = {
  code: keyof typeof errorMessages;
  message?: string;
};
export class APIError extends Error {
  public message: string;
  constructor(details: constructorParams) {
    super(details.message);
    this.name = details.code;
    this.message = details.message || errorMessages[details.code].message;
  }
}
