# Lambda-less outbound HTTP requests on AWS serverless

Three ways of making outbound HTTP requests without using _AWS Lambda_.

## Deployment

1. Replace the value of the `endpoint` variable in the `code-stack.ts`.
1. `npm run bootstrap`
1. `npm run deploy`

## Making the requests

- Manually execute the deployed state machines.
- Manually push messages to the deployed topic.
- Execute the deployed GraphQL endpoint. Could be done via [_Postman_](https://learning.postman.com/docs/sending-requests/supported-api-frameworks/graphql/)
