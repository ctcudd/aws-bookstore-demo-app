* https://aws.amazon.com/blogs/big-data/getting-started-with-trace-analytics-in-amazon-elasticsearch-service/
* https://aws.amazon.com/blogs/opensource/aws-distro-for-opentelemetry-adds-lambda-layers-for-more-languages-and-collector/



!Sub arn:aws:lambda:${AWS::Region}:901920570463:layer:aws-otel-nodejs-ver-0-23-0:1
!Sub arn:aws:lambda:${AWS::Region}:901920570463:layer:aws-otel-python38-ver-1-3-0:1

arn:aws:lambda:us-east-1:901920570463:layer:aws-otel-python38-ver-1-3-0:1


https://raw.githubusercontent.com/aws-observability/aws-otel-lambda/main/adot/collector/config.yaml

https://github.com/open-telemetry/opentelemetry-python/blob/main/README.md#supported-runtimes

Data Prepper instance needs internete access!!! - either public subnet + public ip + igw OR private + nat?

curl -H 'Content-Type: application/json; charset=utf-8' -d '{"resourceSpans":[{"instrumentationLibrarySpans":[{"spans":[{"spanId":"AAAAAAAAAAM=","name":"test-span"}]}]}]}'  localhost:21890/opentelemetry.proto.collector.trace.v1.TraceService/Export

unframed_requests


ssh -i teamservices.pem ec2-user@$(aws ec2 describe-instances --filters "Name=tag:Name,Values=trace-DataPrepperServers" --query "Reservations[0].Instances[0].PublicIpAddress" --output text)
