import { DynamoDBStreamEvent } from 'aws-lambda';
import { sqs } from 'src/lib/sqs';
import AWS from 'aws-sdk';
import { DomainEvent, ensure } from 'src/lib/common';

export const handler = async (event: DynamoDBStreamEvent) => {
  await Promise.all(event.Records.map(record => {
    if (record.eventName !== 'INSERT') return;

    const domainEvent = ensure(record.dynamodb?.NewImage, 'NewImage not found in event');
    const message = AWS.DynamoDB.Converter.unmarshall(domainEvent) as DomainEvent;

    return sqs.sendMessage({
      MessageGroupId: `${message.aggregate}_${message.aggregateId}`,
      MessageDeduplicationId: `${message.aggregate}_${message.aggregateId}_${message.version}`,
      MessageBody: JSON.stringify(message),
      QueueUrl: process.env.USERS_QUEUE_URL as string
    })
      .promise()
      // eslint-disable-next-line no-console
      .then(console.log)
      // eslint-disable-next-line no-console
      .catch(e => console.log('ERROR', e));
  }));
};
