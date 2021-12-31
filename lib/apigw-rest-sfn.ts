import {
  aws_apigateway,
  aws_stepfunctions,
  aws_stepfunctions_tasks
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface APIGWRESTSFNProps {
  endpoint: string;
}

export class APIGWRESTSFN extends Construct {
  constructor(scope: Construct, id: string, props: APIGWRESTSFNProps) {
    super(scope, id);

    const api = new aws_apigateway.RestApi(this, "api");
    api.root.addMethod(
      "GET",
      new aws_apigateway.HttpIntegration(props.endpoint, {
        httpMethod: "POST",
        options: {
          requestTemplates: {
            "application/json": `{
                  "static": "body_payload"
                }`
          },
          requestParameters: {
            "integration.request.header.Content-Type": "'application/json'",
            "integration.request.querystring.token":
              "method.request.querystring.token"
          },
          integrationResponses: [{ statusCode: "200" }]
        },
        // Otherwise the mapping template is ignored.
        // The headers are mapped.
        proxy: false
      }),
      {
        methodResponses: [{ statusCode: "200" }],
        requestParameters: {
          "method.request.querystring.token": true
        }
      }
    );

    const stateMachineDefinition =
      new aws_stepfunctions_tasks.CallApiGatewayRestApiEndpoint(
        this,
        "callAPIGWRESTTask",
        {
          api,
          method: aws_stepfunctions_tasks.HttpMethod.GET,
          stageName: "prod",
          queryParameters: aws_stepfunctions.TaskInput.fromObject({
            "token.$":
              "States.StringToJson(States.Format('[\"{}\"]', $.APIKey))"
          })
        }
      );

    new aws_stepfunctions.StateMachine(this, "stateMachine", {
      definition: stateMachineDefinition
    });
  }
}
