import jwt from 'src/lib/jwt';
import { ensure } from 'src/lib/common';
import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda/trigger/api-gateway-authorizer';
import { userReadRepository } from 'src/components/user';
import { v4 } from 'uuid';

const generatePolicy = (userId: string, effect: string, context: Record<string, any>) => {
  return {
    principalId: userId,
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

const generateAllowPolicy = (userId: string, context: Record<string, any>): Record<string, any> => generatePolicy(userId, 'Allow', context);
const extractToken = (authorization?: string) => authorization?.split(' ').pop();

export const tokenAuthorizer = async (event: APIGatewayTokenAuthorizerEvent) => {
  const token = extractToken(event.authorizationToken);

  if (!token) {
    throw new Error('NotAuthorized');
  }

  const decodedToken = jwt.verify(token) as any; // TODO: do not cast to any

  const user = userReadRepository.find(decodedToken.id);

  if (!user) {
    throw new Error('NotAuthorized');
  }

  return generateAllowPolicy(ensure(decodedToken.id, 'Token must have an ID'), {
    id: decodedToken.id,
    email: decodedToken.email
  });
};

export const tokenOrGuestAuthorizer = async (event: APIGatewayTokenAuthorizerEvent) => {
  const token = extractToken(event.authorizationToken);

  if (!token) {
    return generateAllowPolicy(v4(), {});
  }

  const decodedToken = jwt.verify(token) as any; // TODO: do not cast to any

  const user = userReadRepository.find(decodedToken.id);

  if (!user) {
    throw new Error('NotAuthorized');
  }

  return generateAllowPolicy(ensure(decodedToken.id, 'Token must have an ID'), {
    id: decodedToken.id,
    email: decodedToken.email
  });
};
