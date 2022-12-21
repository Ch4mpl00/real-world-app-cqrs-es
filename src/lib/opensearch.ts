import { Client } from '@opensearch-project/opensearch';
import createAwsOpensearchConnector from 'aws-opensearch-connector';
import AWS from 'aws-sdk';

export const createOpenSearchClient = (endpoint: string) => {
  const client = new Client({
    node: endpoint.startsWith('http') ? endpoint : `https://${endpoint}`,
    ...createAwsOpensearchConnector(AWS.config),
  });

  return client;
};

export type SearchResponse<T> = {
  hits: {
    total: {
      value: number,
      relation: string
    },
    'max_score': any,
    'hits': T[]
  }
}
