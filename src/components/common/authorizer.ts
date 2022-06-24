import jwt from '@lib/jwt'
import { ensure } from '@lib/common';
import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda/trigger/api-gateway-authorizer';
import { userReadRepository } from '@components/user';

const generatePolicy = (sub: string, effect: string, context: Record<string, any>) => {
  return {
    principalId: sub,
    context,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: '*'
        }
      ]
    }
  };
};


export const generateAllowPolicy = (sub: string, context: Record<string, any>): Record<string, any> => generatePolicy(sub, 'Allow', context);
export const extractToken = (authorization?: string) => authorization?.split(' ').pop();

export const tokenAuthorizer = async (event: APIGatewayTokenAuthorizerEvent) => {
  const token = extractToken(event.authorizationToken)

  if (!token) {
    throw new Error('NotAuthorized')
  }

  const decodedToken = jwt.verify(token) as any // TODO: remove any

  const user = userReadRepository.find(decodedToken.id);

  if (!user) {
    throw new Error('NotAuthorized')
  }

  return generateAllowPolicy(ensure(decodedToken.id, 'Token must have an ID'), {
    id: decodedToken.id,
    email: decodedToken.email,
  });
};
