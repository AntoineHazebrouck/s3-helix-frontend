const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("node:crypto");

const TABLE_NAME = process.env.MESSAGES_TABLE;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

function buildAutoReply(messageContent, originalAuthor) {
    if (messageContent.includes("bonjour")) {
        return `Bonjour ${originalAuthor} ! J'espère que vous passez une bonne journée.`;
    }
    if (messageContent.includes("aide")) {
        return `Bonjour ${originalAuthor}, avez-vous consulté notre documentation ?`;
    }
    return null;
}

exports.handler = async (event) => {
    for (const record of event.Records || []) {
        if (record.eventName !== 'INSERT') continue;

        const newMessage = record.dynamodb.NewImage;
        const messageContent = (newMessage?.content?.S || '').toLowerCase();
        const originalAuthor = newMessage?.username?.S || '';

        // Évite les boucles entre bots
        if (originalAuthor === 'AutoReplyBot' || originalAuthor === 'WeatherBot') continue;

        const replyContent = buildAutoReply(messageContent, originalAuthor);
        if (!replyContent) continue;

        const replyItem = {
            id: randomUUID(),
            username: "AutoReplyBot",
            content: replyContent,
            timestamp: Date.now() + 1,
        };

        try {
            await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: replyItem }));
            console.log(`Réponse automatique envoyée à ${originalAuthor}`);
        } catch (error) {
            console.error("Erreur lors de l'envoi de la réponse auto :", error);
        }
    }
    return `Processed ${event.Records?.length || 0} records.`;
};