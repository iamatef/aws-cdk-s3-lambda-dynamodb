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
