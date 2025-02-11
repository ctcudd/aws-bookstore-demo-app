"use strict";

var AWS = require("aws-sdk");
try {
  var AWSXRay = require('aws-xray-sdk');
  AWS = AWSXRay.captureAWS(require('aws-sdk'));
} catch(e) {
    console.error("XRay library not available");
}
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// ListItemsInCart - List all items in a customer's cart
exports.handler = (event, context, callback) => {
  
  // Return immediately if being called by warmer 
  if (event.source === "warmer") {
    return callback(null, "Lambda is warm");
  }

  const params = {
    TableName: process.env.TABLE_NAME, // [ProjectName]-Cart
    // 'KeyConditionExpression' defines the condition for the query
    // - 'customerId = :customerId': only return items with matching 'customerId'
    //                               partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':customerId': defines 'customerId' to be Identity Pool identity id
    //                  of the authenticated user
    KeyConditionExpression: "customerId = :customerId",
    ExpressionAttributeValues: {
      ":customerId": event.requestContext.identity.cognitoIdentityId
    }
  };

  dynamoDb.query(params, (error, data) => {
    // Set response headers to enable CORS (Cross-Origin Resource Sharing)
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials" : true
    };

    // Return status code 500 on error
    if (error) {
      const response = {
        statusCode: 500,
        headers: headers,
        body: error
      };
      callback(null, response);
      return;
   }

    // Return status code 200 and the retrieved items on success
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(data.Items)
    };
    callback(null, response);
  });
}
