"use strict";

var AWS = require("aws-sdk");
try {
  var AWSXRay = require('aws-xray-sdk');
  AWS = AWSXRay.captureAWS(require('aws-sdk'));
} catch(e) {
    console.error("XRay library not available");
}
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// ListBooks - List all books or list all books in a particular category
exports.handler = (event, context, callback) => {
  
  // Return immediately if being called by warmer 
  if (event.source === "warmer") {
    return callback(null, "Lambda is warm");
  }

  // Set response headers to enable CORS (Cross-Origin Resource Sharing)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials" : true
  };

  // Query books for a particular category
  if (event.queryStringParameters) {
    const params = {
      TableName: process.env.TABLE_NAME, // [ProjectName]-Books
      IndexName: "category-index",
      // 'KeyConditionExpression' defines the condition for the query
      // - 'category = :category': only return items with matching 'category' index
      // 'ExpressionAttributeValues' defines the value in the condition
      // - ':category': defines 'category' to be the query string parameter
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": event.queryStringParameters.category
      }
    };
    dynamoDb.query(params, (error, data) => {
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
  
  // List all books in bookstore
  else {
    const params = {
      TableName: process.env.TABLE_NAME // [ProjectName]-Books
    };
 
    dynamoDb.scan(params, (error, data) => {
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
}
