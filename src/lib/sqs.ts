import AWS from 'aws-sdk';

export const sqs = new AWS.SQS({
  apiVersion: 'latest',
  logger: console
});
