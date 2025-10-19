const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const TABLE_NAME = "dynamodb-all-messages";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    // Affiche l'événement complet dans les logs CloudWatch, très utile pour le débogage
    console.log("Received event:", JSON.stringify(event, null, 2));

    // 1. Récupération du username depuis les "claims" de l'Authorizer Cognito
    // C'est la source de vérité pour l'identité de l'utilisateur.
    // 'cognito:username' est le claim standard, plus fiable que 'username'.
    const username = event.requestContext?.authorizer?.claims?.['email']; // username was not configured from the start so too late

    // Si l'Authorizer Cognito est bien configuré, le username sera toujours présent.
    // S'il est absent, cela signifie que la requête n'a pas été authentifiée correctement.
    if (!username) {
        return {
            statusCode: 401, // Unauthorized
            body: JSON.stringify({ message: "Utilisateur non authentifié." }),
        };
    }

    // 2. Analyse du corps de la requête
    let body;
    try {
        body = event.body ? JSON.parse(event.body) : {};
    } catch (error) {
        return {
            statusCode: 400, // Bad Request
            body: JSON.stringify({ message: "Le corps de la requête contient un JSON invalide." }),
        };
    }
    
    // Correction : Le contenu du message vient du corps (body) de la requête
    const { messageContent } = body;

    if (!messageContent || typeof messageContent !== 'string' || messageContent.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Le contenu du message est requis et ne peut être vide." }),
        };
    }

    // 3. Préparation de l'objet à sauvegarder
    const item = {
        id: randomUUID(),
        username: username, // On utilise le username vérifié par Cognito
        content: messageContent.trim(),
        timestamp_utc_iso8601: new Date().toISOString(),
        channel_id: 'helix' // Assurez-vous que cet attribut est pertinent pour votre modèle de données
    };

    const params = {
        TableName: TABLE_NAME,
        Item: item,
    };

    // 4. Écriture dans DynamoDB
    try {
        const command = new PutCommand(params);
        await docClient.send(command);
        
        return {
            statusCode: 201, // Created
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(item),
        };
    } catch (error) {
        console.error("Erreur DynamoDB:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Erreur lors de la publication du message." }),
        };
    }
};