const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const TABLE_NAME = process.env.MESSAGES_TABLE;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    for (const record of event.Records) {
        // On ne réagit qu'aux nouveaux messages (INSERT)
        if (record.eventName === 'INSERT') {
            const newMessage = record.dynamodb.NewImage;
            const messageContent = newMessage.content.S.toLowerCase(); // Contenu du message en minuscule
            const originalAuthor = newMessage.username.S;

            // On évite que le bot se réponde à lui-même !
            if (originalAuthor === 'AutoReplyBot') {
                continue;
            }

            let replyContent = null;

            // Analyse simple des mots-clés comme demandé [cite: 168]
            if (messageContent.includes("bonjour")) {
                replyContent = `Bonjour ${originalAuthor} ! J'espère que vous passez une bonne journée.`;
            } else if (messageContent.includes("aide")) {
                replyContent = `Bonjour ${originalAuthor}, avez-vous consulté notre documentation ?`;
            }

            if (replyContent) {
                const replyItem = {
                    id: randomUUID(),
                    username: "AutoReplyBot",
                    content: replyContent,
                    timestamp: Date.now() + 1, // On ajoute 1ms pour être sûr qu'il apparaisse après
                };

                const command = new PutCommand({
                    TableName: TABLE_NAME,
                    Item: replyItem,
                });

                try {
                    await docClient.send(command);
                    console.log(`Réponse automatique envoyée à ${originalAuthor}`);
                } catch (error) {
                    console.error("Erreur lors de l'envoi de la réponse auto :", error);
                }
            }
        }
    }
    return `Processed ${event.Records.length} records.`;
};