import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { APIGWHTTPSFN } from "./apigw-http-sfn";
import { APIGWRESTSFN } from "./apigw-rest-sfn";
import { SNS } from "./sns";

export class CodeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const endpoint = "ENDPOINT_YOU_WANT_TO_MAKE_REQUEST_TO";

    new APIGWRESTSFN(this, "APIGWRESTSFN", { endpoint });
    new APIGWHTTPSFN(this, "APIGWHTTPSFN", { endpoint });
    new SNS(this, "SNS", { endpoint });
  }
}
