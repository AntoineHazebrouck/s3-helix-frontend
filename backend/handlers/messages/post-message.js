const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const TABLE_NAME = process.env.MESSAGES_TABLE;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    // Username peut venir d'un authorizer Cognito ou, à défaut, d'un header/appel manuel
    const claimsUsername = event?.requestContext?.authorizer?.claims?.username;
    const headers = Object.fromEntries(
        Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v])
    );
    const body = event.body ? JSON.parse(event.body) : {};
    const usernameHeader = headers["x-username"] || headers["username"];
    const username = claimsUsername || body.username || usernameHeader || "Anonymous";
    const { messageContent } = body;

    if (!messageContent) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
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
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Erreur lors de la publication du message." }),
        };
    }
};