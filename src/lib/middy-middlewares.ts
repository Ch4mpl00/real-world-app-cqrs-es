import Joi from 'joi';
import _ from 'lodash';

export type JoiSchemaInterface = {
  queryStringParameters?: { [name: string]: Joi.AnySchema };
  pathParameters?: { [name: string]: Joi.AnySchema };
  body?: { [name: string]: Joi.AnySchema };
  headers?: { [name: string]: Joi.AnySchema };
}

export const validate = (schema: JoiSchemaInterface) => {
  return {
    before: async (request: any) => {
      const event = _.pick(request.event, ...Object.keys(schema));
      const validatedObject = await Joi.object(schema).validate(event, { abortEarly: false });

      if (validatedObject.error) return {
        statusCode: 422,
        body: JSON.stringify({ error: validatedObject.error.details })
      };

      request.event = { ...request.event, ...validatedObject };
    }
  };
};
