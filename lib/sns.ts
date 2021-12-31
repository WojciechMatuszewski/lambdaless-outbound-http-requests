import { aws_sns } from "aws-cdk-lib";
import { Construct } from "constructs";

interface SNSProps {
  endpoint: string;
}

export class SNS extends Construct {
  constructor(scope: Construct, id: string, props: SNSProps) {
    super(scope, id);

    const topic = new aws_sns.Topic(this, "topic");
    new aws_sns.Subscription(this, "subscription", {
      // Keep in mind the filtering capabilities!
      endpoint: props.endpoint,
      protocol: aws_sns.SubscriptionProtocol.HTTPS,
      topic
    });
  }
}
