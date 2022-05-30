import { DynamoDBStreamEvent } from 'aws-lambda';
import { sqs } from '@lib/sqs'
import { Event } from '@components/common/events';
import AWS from 'aws-sdk';
import { ensure } from '@lib/common';

export const handler = async (event: DynamoDBStreamEvent) => {
  await Promise.all(event.Records.map(record => {
    if (record.eventName !== 'INSERT') return;

    const domainEvent = ensure(record.dynamodb?.NewImage, 'NewImage not found in event')
    const message = AWS.DynamoDB.Converter.unmarshall(domainEvent) as Event;

    return sqs.sendMessage({
      MessageGroupId: `${message.aggregate}_${message.aggregateId}`,
      MessageDeduplicationId: `${message.aggregate}_${message.aggregateId}_${message.version}`,
      MessageBody: JSON.stringify(message),
      QueueUrl: process.env.USERS_QUEUE_URL as string
    })
      .promise()
      .then(console.log)
      .catch(e => console.log('ERROR', e))
  }))
}
