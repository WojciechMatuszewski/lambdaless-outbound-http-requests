import { Construct } from "constructs";
import * as aws_appsync from "@aws-cdk/aws-appsync-alpha";
import { CfnOutput } from "aws-cdk-lib";
import { URL } from "url";

interface AppSyncHTTPResolverProps {
  endpoint: string;
}

export class AppSyncHTTPResolver extends Construct {
  constructor(scope: Construct, id: string, props: AppSyncHTTPResolverProps) {
    super(scope, id);

    const url = new URL(props.endpoint);

    const api = new aws_appsync.GraphqlApi(this, "GraphqlApi", {
      name: "GraphqlApi",
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: aws_appsync.AuthorizationType.API_KEY
        }
      }
    });

    const httpDataSource = new aws_appsync.HttpDataSource(
      this,
      "HttpDataSource",
      {
        api: api,
        endpoint: url.origin
      }
    );

    api.addMutation(
      "outboundRequest",
      new aws_appsync.ResolvableField({
        returnType: aws_appsync.GraphqlType.string({ isRequired: true }),
        dataSource: httpDataSource,
        requestMappingTemplate: aws_appsync.MappingTemplate.fromString(
          /**
           * The `resourcePath` has to be defined.
           * It cannot be an empty string.
           */
          `{
            "version": "2018-05-29",
            "method": "POST",
            "params": {
              "headers": {
                "Content-Type": "application/json"
              }
            },
            "resourcePath": $util.toJson(\"${url.pathname}\")
          }`
        ),
        responseMappingTemplate: aws_appsync.MappingTemplate.fromString(
          `$util.toJson("static response")`
        )
      })
    );

    // Required, API has to have `Query` operation defined
    api.addQuery(
      "mockQuery",
      new aws_appsync.ResolvableField({
        returnType: aws_appsync.GraphqlType.boolean(),
        dataSource: new aws_appsync.NoneDataSource(this, "NoneDataSource", {
          api
        }),
        requestMappingTemplate: aws_appsync.MappingTemplate.fromString(
          JSON.stringify({
            version: "2018-05-29",
            payload: {}
          })
        ),
        responseMappingTemplate:
          aws_appsync.MappingTemplate.fromString(`$util.toJson(true)`)
      })
    );

    new CfnOutput(this, "GraphQLApiEndpoint", {
      value: api.graphqlUrl
    });

    new CfnOutput(this, "GraphQLApiKey", {
      value: api.apiKey as string
    });
  }
}
