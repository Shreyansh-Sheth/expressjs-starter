import { Request, RequestHandler, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import {
  z,
  ZodEffects,
  ZodError,
  ZodSchema,
  ZodType,
  ZodTypeDef,
  ZodAny,
} from "zod";

type NonReadOnly<T> = { -readonly [P in keyof T]: NonReadOnly<T[P]> };

export function stripReadOnly<T>(readOnlyItem: T): NonReadOnly<T> {
  return readOnlyItem as NonReadOnly<T>;
}

export declare type RequestValidation<TParams, TQuery, TBody> = {
  params?: ZodSchema<TParams>;
  query?: ZodSchema<TQuery>;
  body?: ZodSchema<TBody>;
};
export declare type RequestProcessing<TParams, TQuery, TBody> = {
  params?: ZodEffects<ZodAny, TParams>;
  query?: ZodEffects<ZodAny, TQuery>;
  body?: ZodEffects<ZodAny, TBody>;
};

export declare type TypedRequest<
  TParams extends ZodType<unknown, ZodTypeDef, unknown>,
  TQuery extends ZodType<unknown, ZodTypeDef, unknown>,
  TBody extends ZodType<unknown, ZodTypeDef, unknown>
> = Request<z.infer<TParams>, unknown, z.infer<TBody>, z.infer<TQuery>>;

export declare type TypedRequestBody<
  TBody extends ZodType<unknown, ZodTypeDef, unknown>
> = Request<ParamsDictionary, unknown, z.infer<TBody>, unknown>;

export declare type TypedRequestParams<
  TParams extends ZodType<unknown, ZodTypeDef, unknown>
> = Request<z.infer<TParams>, unknown, unknown, unknown>;
export declare type TypedRequestQuery<
  TQuery extends ZodType<unknown, ZodTypeDef, unknown>
> = Request<ParamsDictionary, unknown, unknown, z.infer<TQuery>>;

type ErrorListItem = {
  type: "Query" | "Params" | "Body";
  errors: ZodError<unknown>;
};

export const sendErrors: (
  errors: Array<ErrorListItem>,
  res: Response
) => void = (errors, res) => {
  return res
    .status(400)
    .send(errors.map((error) => ({ type: error.type, errors: error.errors })));
};
export const sendError: (error: ErrorListItem, res: Response) => void = (
  error,
  res
) => {
  return res.status(400).send({ type: error.type, errors: error.errors });
};

export function processRequestBody<TBody>(
  effects: ZodSchema<TBody>
): RequestHandler<ParamsDictionary, unknown, TBody, unknown>;
export function processRequestBody<TBody>(
  effects: ZodEffects<ZodAny, TBody>
): RequestHandler<ParamsDictionary, unknown, TBody, unknown>;
export function processRequestBody<TBody>(
  effectsSchema: ZodEffects<ZodAny, TBody> | ZodSchema<TBody>
): RequestHandler<ParamsDictionary, unknown, TBody, unknown> {
  return (req, res, next) => {
    const parsed = effectsSchema.safeParse(req.body);
    if (parsed.success) {
      req.body = parsed.data;
      return next();
    } else {
      return sendErrors([{ type: "Body", errors: parsed.error }], res);
    }
  };
}

export function processRequestParams<TParams>(
  effects: ZodSchema<TParams>
): RequestHandler<TParams, unknown, unknown, unknown>;
export function processRequestParams<TParams>(
  effects: ZodEffects<ZodAny, TParams>
): RequestHandler<TParams, unknown, unknown, unknown>;
export function processRequestParams<TParams>(
  effectsSchema: ZodEffects<ZodAny, TParams> | ZodSchema<TParams>
): RequestHandler<TParams, unknown, unknown, unknown> {
  return (req, res, next) => {
    const parsed = effectsSchema.safeParse(req.params);
    if (parsed.success) {
      req.params = parsed.data;
      return next();
    } else {
      return sendErrors([{ type: "Params", errors: parsed.error }], res);
    }
  };
}

export function processRequestQuery<TQuery>(
  effects: ZodSchema<TQuery>
): RequestHandler<ParamsDictionary, unknown, unknown, TQuery>;
export function processRequestQuery<TQuery>(
  effects: ZodEffects<ZodAny, TQuery>
): RequestHandler<ParamsDictionary, unknown, unknown, TQuery>;
export function processRequestQuery<TQuery>(
  effectsSchema: ZodEffects<ZodAny, TQuery> | ZodSchema<TQuery>
): RequestHandler<ParamsDictionary, unknown, unknown, TQuery> {
  return (req, res, next) => {
    const parsed = effectsSchema.safeParse(req.query);
    if (parsed.success) {
      req.query = parsed.data;
      return next();
    } else {
      return sendErrors([{ type: "Query", errors: parsed.error }], res);
    }
  };
}

export function processRequest<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown
>(
  schemas: RequestProcessing<TParams, TQuery, TBody>
): RequestHandler<TParams, unknown, TBody, TQuery>;
export function processRequest<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown
>(
  schemas: RequestValidation<TParams, TQuery, TBody>
): RequestHandler<TParams, unknown, TBody, TQuery>;
export function processRequest<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown
>(
  schemas:
    | RequestValidation<TParams, TQuery, TBody>
    | RequestProcessing<TParams, TQuery, TBody>
): RequestHandler<TParams, unknown, TBody, TQuery> {
  return (req, res, next) => {
    const errors: Array<ErrorListItem> = [];
    if (schemas.params) {
      const parsed = schemas.params.safeParse(req.params);
      if (parsed.success) {
        req.params = parsed.data;
      } else {
        errors.push({ type: "Params", errors: parsed.error });
      }
    }
    if (schemas.query) {
      const parsed = schemas.query.safeParse(req.query);
      if (parsed.success) {
        req.query = parsed.data;
      } else {
        errors.push({ type: "Query", errors: parsed.error });
      }
    }
    if (schemas.body) {
      const parsed = schemas.body.safeParse(req.body);
      if (parsed.success) {
        req.body = parsed.data;
      } else {
        errors.push({ type: "Body", errors: parsed.error });
      }
    }
    if (errors.length > 0) {
      return sendErrors(errors, res);
    }
    return next();
  };
}

export const validateRequestBody: <TBody>(
  zodSchema: ZodSchema<TBody>
) => RequestHandler<ParamsDictionary, unknown, TBody, unknown> =
  (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (parsed.success) {
      return next();
    } else {
      return sendErrors([{ type: "Body", errors: parsed.error }], res);
    }
  };

export const validateRequestParams: <TParams>(
  zodSchema: ZodSchema<TParams>
) => RequestHandler<TParams, unknown, unknown, unknown> =
  (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.params);
    if (parsed.success) {
      return next();
    } else {
      return sendErrors([{ type: "Params", errors: parsed.error }], res);
    }
  };

export const validateRequestQuery: <TQuery>(
  zodSchema: ZodSchema<TQuery>
) => RequestHandler<ParamsDictionary, unknown, unknown, TQuery> =
  (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (parsed.success) {
      return next();
    } else {
      return sendErrors([{ type: "Query", errors: parsed.error }], res);
    }
  };

export const validateRequest: <
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown
>(
  schemas: RequestValidation<TParams, TQuery, TBody>
) => RequestHandler<TParams, unknown, TBody, TQuery> =
  ({ params, query, body }) =>
  (req, res, next) => {
    const errors: Array<ErrorListItem> = [];
    if (params) {
      const parsed = params.safeParse(req.params);
      if (!parsed.success) {
        errors.push({ type: "Params", errors: parsed.error });
      }
    }
    if (query) {
      const parsed = query.safeParse(req.query);
      if (!parsed.success) {
        errors.push({ type: "Query", errors: parsed.error });
      }
    }
    if (body) {
      const parsed = body.safeParse(req.body);
      if (!parsed.success) {
        errors.push({ type: "Body", errors: parsed.error });
      }
    }
    if (errors.length > 0) {
      return sendErrors(errors, res);
    }
    return next();
  };
