import AWS from 'aws-sdk';

export const sqs = new AWS.SQS({
  apiVersion: 'latest',
  logger: console
});

export const sns = new AWS.SNS({
  apiVersion: 'latest',
  logger: console,
});
