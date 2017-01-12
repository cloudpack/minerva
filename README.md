# Minerva

You can view AWS Athena structure and execute queries to AWS Athena on the web by using Minerva.


# Installation

## Build Admin LTE less.

```
$ cd web
$ grunt less
```


## Build Minerva.

```
$ cd web
```

Create config.json.
```
$ vi config.json
```

```
{
  "base": ${API-GW-ENDPOINT}
}
```

```
$ webpack
```


## Build Kotlin

```
$ cd athena-bridge
$ ./gradle buildZip
```


## Upload to Lambda.

Create config.json.

```
$ vi athena-bridge/src/main/kotlin/athena/config.json
```

```
{
  "driver": "jdbc:awsathena://athena.${REGION}.amazonaws.com:443",
  "bucket": "s3://${BUCKET}/logs",
  "access_key": "${ACCESS-KEY}",
  "secret_key": "${SECRET-KEY}"
}
```


```
$ cd athena-bridge
$ aws lambda create-function \
    --function-name athena-query \
    --zip-file fileb://build/distributions/athena-bridge-1.0.zip \
    --runtime java8 \
    --handler athena.Structure::handler \
    --region ${REGION} \
    --role ${ROLE-ARN}  \
    --timeout ${TIMEOUT} \
    --memory-size ${MEMORY} \
    --profile ${PROFILE} \
```

```
$ cd athena-bridge
$ aws lambda create-function \
    --function-name athena-structure \
    --zip-file fileb://build/distributions/athena-bridge-1.0.zip \
    --runtime java8  \
    --handler athena.Structure::handler \
    --region ${REGION} \
    --role ${ROLE-ARN}  \
    --timeout ${TIMEOUT} \
    --memory-size ${MEMORY} \
    --profile ${PROFILE}
```


## Connect API GW to Lambda.

Set on your AWS management console.
