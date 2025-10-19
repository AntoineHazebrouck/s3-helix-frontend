const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

// Le nom de la table est maintenant défini directement dans le code.
const TABLE_NAME = "dynamodb-all-messages";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    // La spécification demande une pagination par 10.
    // Comme la table est en (id HASH, timestamp RANGE) et que l'on ne connaît pas l'id,
    // on fait un Scan paginé puis on trie par timestamp côté application.
    // Pour paginer, on peut passer un "ExclusiveStartKey" reçu d'un appel précédent.

    console.log();
    
    const { lastKey } = event.queryStringParameters || {};
    const exclusiveStartKey = lastKey ? JSON.parse(Buffer.from(lastKey, 'base64').toString('utf8')) : undefined;

    const params = {
        TableName: TABLE_NAME,
        Limit: 10, // on scanne un peu plus large pour pouvoir trier et couper à 10
        ExclusiveStartKey: exclusiveStartKey,
        FilterExpression: "channel_id = :channel",
        ExpressionAttributeValues: {
            ":channel": "helix"
        }
    };

    try {
        const command = new ScanCommand(params);
        const data = await docClient.send(command);

        console.log(data);
        

        // Tri décroissant par timestamp
        const sorted = (data.Items || []).sort((a, b) => b.timestamp_utc_iso8601 - a.timestamp_utc_iso8601);

        console.log(sorted);
        
        const page = sorted.slice(0, 10);

        // Préparation de la clé de pagination suivante si disponible
        const nextKey = data.LastEvaluatedKey
            ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64')
            : null;

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Important pour CORS
            },
            body: JSON.stringify({ items: page, nextKey }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Erreur lors de la récupération des messages." }),
        };
    }
};