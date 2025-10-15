const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

// Le nom de la table est passé via une variable d'environnement
const TABLE_NAME = process.env.MESSAGES_TABLE;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    // La spécification demande une pagination par 10 [cite: 140]
    // On peut utiliser `limit` et `exclusiveStartKey` pour cela
    
    const params = {
        TableName: TABLE_NAME,
        // ScanIndexForward: false trie par la clé de tri (timestamp) en ordre décroissant
        ScanIndexForward: false, 
        Limit: 10
    };

    try {
        const command = new QueryCommand(params);
        const data = await docClient.send(command);
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Important pour CORS
            },
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Erreur lors de la récupération des messages." }),
        };
    }
};