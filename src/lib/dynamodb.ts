import AWS from 'aws-sdk';

export const createDynamodbClient = (region: string, endpoint?: string) => {
  return new AWS.DynamoDB.DocumentClient({
    region,
    logger: console,
    endpoint
  });
}
