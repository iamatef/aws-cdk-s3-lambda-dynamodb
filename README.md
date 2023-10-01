## CDK S3 Lambda DynamoDB

This CDK project demo the process of creating a Lambda function that gets triggered when uploading a file to an S3 Bucked. The Lambda function will read the file name and size, then insert it to a DynamoDB table.

### Prerequisites

Before you begin, ensure you have the following installed and set up:

- [Node.js and npm](https://nodejs.org/en/download/)
- AWS CLI configured with necessary credentials and permissions

### Steps

#### 1. **Create a New Project Folder**

Create a new folder for your CDK project. Replace `your-project-name` with a suitable name for your project.

```bash
mkdir your-project-name
cd your-project-name
```

#### 2. **Initialize the CDK Project**

Inside your project folder, initialize a new CDK project with TypeScript.

```bash
cdk init app --language javascript
```


#### 3. **Add Lambda Function and API Gateway Code**

Edit the `lib/your-project-name-stack.ts` file and add your Lambda function and API Gateway code to the `YourProjectNameStack` class. You can use AWS Lambda and API Gateway classes provided by CDK for this purpose.

Example code for creating a Lambda function and API Gateway:

```typescript
//stack
const { Stack } = require('aws-cdk-lib');
 
//s3
const s3 = require('aws-cdk-lib/aws-s3');

//s3 notifications
const s3n = require('aws-cdk-lib/aws-s3-notifications');

//remove policy
const { RemovalPolicy } = require('aws-cdk-lib');

//dynamodb
const dynamodb = require('aws-cdk-lib/aws-dynamodb');

//lambda
const lambda = require('aws-cdk-lib/aws-lambda');

//cdk
const cdk = require('aws-cdk-lib');
 
 

class CdkTestStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // an S3 bucket to store our files, when a file is uploaded to this bucket, it will trigger the lambda function
    const bucket = new s3.Bucket(this, 'Bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // the lambda function, the code is in the lambda folder
    const helloLambda = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler',
    });

   // set the lambda function as the handler for the bucket
    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(helloLambda));  

    // DynamoDB table for storing the file names and sizes by the lambda function
    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'name', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // grant the lambda function read/write permissions to the table
    table.grantReadWriteData(helloLambda);

    // save the table name in an environment variable, this will be used by the lambda function
    helloLambda.addEnvironment('TABLE_NAME', table.tableName);

    // output the bucket name and table name to the stack output
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'TableName', { value: table.tableName });

    
  }
}

module.exports = { CdkTestStack }


```

 

#### 4. **Synthesize the CDK Project**

Generate the CloudFormation template for your CDK project.

```bash
cdk synth
```

#### 5. **Deploy the CDK Project**

Deploy your CDK project, which will create the Lambda function and API Gateway resources in AWS.

```bash
cdk deploy
```

### Clean Up

To avoid incurring unnecessary costs, make sure to destroy the resources when you are done with your project.

```bash
cdk destroy
```

This will remove all the resources created by your CDK stack.