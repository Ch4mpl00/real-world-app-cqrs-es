import { DynamoDBStreamEvent } from 'aws-lambda';
import { sns } from 'src/lib/sqs';
import AWS from 'aws-sdk';
import { ensure, DomainEvent } from 'src/lib/common';

export const handler = async (event: DynamoDBStreamEvent) => {
  await Promise.all(event.Records.map(record => {
    if (record.eventName !== 'INSERT') return;

    const domainEvent = ensure(record.dynamodb?.NewImage, 'NewImage not found in event');
    const message = AWS.DynamoDB.Converter.unmarshall(domainEvent) as DomainEvent;

    return sns.publish({
      Message: JSON.stringify(message),
      TopicArn: ensure(process.env.SNS_EVENT_BUS_TOPIC, 'SNS_EVENT_BUS_TOPIC not found in env'),
      MessageGroupId: `${message.aggregate}_${message.aggregateId}`,
      MessageDeduplicationId: `${message.aggregate}_${message.aggregateId}_${message.version}`,
    }).promise()
      // eslint-disable-next-line no-console
      .then(console.log)
      // eslint-disable-next-line no-console
      .catch(e => console.log('ERROR', e));
  }));
};
