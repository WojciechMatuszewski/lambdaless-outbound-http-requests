import { aws_stepfunctions, aws_stepfunctions_tasks, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as aws_apigatewayv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as aws_apigatewayv2_integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

interface APIGWHTTPSFNProps {
  endpoint: string;
}

export class APIGWHTTPSFN extends Construct {
  constructor(scope: Construct, id: string, props: APIGWHTTPSFNProps) {
    super(scope, id);

    const api = new aws_apigatewayv2.HttpApi(this, "api");

    const parameterMapping = new aws_apigatewayv2.ParameterMapping();
    parameterMapping.appendHeader("Content-Type", {
      value: "application/json"
    });

    api.addRoutes({
      path: "/",
      methods: [aws_apigatewayv2.HttpMethod.GET],
      integration: new aws_apigatewayv2_integrations.HttpUrlIntegration(
        "integration",
        props.endpoint,
        {
          method: aws_apigatewayv2.HttpMethod.POST,
          parameterMapping: parameterMapping
        }
      )
    });

    const stateMachineDefinition =
      new aws_stepfunctions_tasks.CallApiGatewayHttpApiEndpoint(
        this,
        "callAPIGWHTTPTask",
        {
          apiId: api.httpApiId,
          apiPath: "/",
          apiStack: Stack.of(this),
          method: aws_stepfunctions_tasks.HttpMethod.GET,
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
