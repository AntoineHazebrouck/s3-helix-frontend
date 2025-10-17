const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const TABLE_NAME = process.env.MESSAGES_TABLE;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const username = event.requestContext.authorizer.claims.username;
    const { messageContent } = JSON.parse(event.body);

    if (!messageContent) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Le contenu du message est requis." }),
        };
    }

    const item = {
        id: randomUUID(),
        username: username,
        content: messageContent,
        timestamp: Date.now()
    };

    const params = {
        TableName: TABLE_NAME,
        Item: item,
    };

    try {
        const command = new PutCommand(params);
        await docClient.send(command);
        
        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(item),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Erreur lors de la publication du message." }),
        };
    }
};