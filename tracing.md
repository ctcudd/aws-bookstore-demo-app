# Trace Analytics

###Changes Overview

1. Network

    * Added a public subnet for hosting the data prepper instances:
        * Lambda functions outside of a VPC require a public endpoint to send traces to
        * Data Prepper instances need internet access to download packages and updates (nat gateway could possibly be used as alternative)
    

2. Data Prepper

    * Seems to crash frequently (nightly) so I wrapped in an autoscaling group with health checks
    * Added two load balancers for receiving traces, Lambda's within a VPC send traces to the private LB, Lambda's without a VPC use the public LB

3. Elasticsearch

    * Updated version to 7.10 to include trace analytics plugin
    * Issues with the `t2.small.elasticsearch` instance not being available in some AZ's, switched to `t3.medium.elasticsearch
 
4. Lambda 

    1. Layers 
    
        a. [Data Collector Lambda Layer](https://aws-otel.github.io/docs/getting-started/lambda)
        
        [For Python](https://aws-otel.github.io/docs/getting-started/lambda/lambda-python):
        ```
        !Sub arn:aws:lambda:${AWS::Region}:901920570463:layer:aws-otel-python38-ver-1-3-0:1
        ```
            
        [For node]():
        ```
        !Sub arn:aws:lambda:${AWS::Region}:901920570463:layer:aws-otel-python38-ver-1-3-0:1
        ```
       
        b. Collector Config Layer - contains the following file only. 
            * Concerned about `insecure: true`, need to add SSL keys for security
            * See [custom config](https://aws-otel.github.io/docs/getting-started/lambda#custom-configuration-for-the-adot-collector-on-lambda)
        
        ```
        receivers:
          otlp:
            protocols:
              grpc:
              http:
        exporters:
          otlp/data-prepper:
            endpoint: ${DATA_PREPPER_HOST}:21890
            insecure: true
          logging:
            loglevel: debug
        service:
          pipelines:
            traces:
              receivers: [otlp]
              exporters: [otlp/data-prepper]
        ```
        c. Xray SDK - is not required, but when the library is included it automatically collects subsegments
            * For nodejs see: [Tracing calls to downstream ...](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-httpclients.html)
            * For python see: [Patching libraries ...](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-python-patching.html)
    
    2. Environment Variables
        1. AWS_LAMBDA_EXEC_WRAPPER - to activate otel layer
            * for python: `/opt/otel-instrument`
            * for node: `/opt/otel-handler`
        2. OPENTELEMETRY_COLLECTOR_CONFIG_FILE - path to tracing config file
        3. DATA_PREPPER_HOST - the dns address of the load balancer to which traces are exported 
        4. [OTEL_EXPORTER_OTLP_ENDPOINT](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md) - the address of the otel collector.  required for nodejs, not really sure why.
        
    3. Role - added managed policy arn 'arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess' to ensure proper xray permissions
    4. Runtime, moved to align with versions supported by otel layer
        * nodejs functions require a `package.json` file (containing at least `{}`), [due to a bug in otel layer](https://github.com/open-telemetry/opentelemetry-js/issues/2193)
    5. TracingConfig needs to be active:
        ```
        TracingConfig:
          Mode: Active
        ```

---
Useful commands:

```shell script
export AWS_REGION=us-west-2
export PROJECT_NAME=bookf
export DATA_PREPPER_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=$PROJECT_NAME-DataPrepperServers" --query "Reservations[*].Instances[*].PublicIpAddress" --output text)
export ES_DOMAIN=$(aws es describe-elasticsearch-domain --domain-name $PROJECT_NAME-domain --query "DomainStatus.Endpoints.vpc" --output text)

# tail data prepper logs
ssh -i key.pem ec2-user@${DATA_PREPPER_IP}
tail -f /var/log/data-prepper.out
# now test lambda function, results should appear in logs within seconds

# open ssh tunnel for kibana
ssh -i key.pem -L 9200:${ES_DOMAIN}:443 -N ec2-user@${DATA_PREPPER_IP}
# now open browser to localhost:9200
```
