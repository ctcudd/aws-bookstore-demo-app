"use strict";

var AWS = require("aws-sdk");
try {
    var AWSXRay = require('aws-xray-sdk');
    AWS = AWSXRay.captureAWS(require('aws-sdk'));
} catch(e) {
    console.error("XRay library not available");
}
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// GetBook - Get book informaton for a given book id
exports.handler = async (event, context) => {

    // Return immediately if being called by warmer
    if (event.source === "warmer") {
        return JSON.stringify("Lambda is warm");
    }

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials" : true
    };

    const params = {
        TableName: process.env.TABLE_NAME, // [ProjectName]-Books
        // 'Key' defines the partition key of the item to be retrieved
        // - 'id': a unique identifier for the book (uuid)
        Key: {
            id: event.pathParameters.id
        }
    };

    try {
        const data = await dynamoDb.get(params).promise();
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data.Item)
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: headers,
            body: err
        };
    }
};
