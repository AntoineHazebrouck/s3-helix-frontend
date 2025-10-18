const https = require('node:https');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("node:crypto");

// Le nom de la table doit être configuré dans les variables d'environnement de la Lambda
const TABLE_NAME = process.env.MESSAGES_TABLE; 
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Fonction pour appeler l'API météo (identique à celle du WeatherBot)
const getWeather = () => {
    return new Promise((resolve, reject) => {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=50.63&longitude=3.06&current=temperature_2m,cloud_cover,rain";
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', (err) => reject(err));
    });
};

/**
 * Ce handler est déclenché par une règle EventBridge (toutes les heures).
 * Il ne lit pas de message existant, il crée un nouveau post de manière proactive.
 */
exports.handler = async (event) => {
    console.log("Exécution de la tâche planifiée de météo...");

    try {
        const weatherData = await getWeather();
        const current = weatherData.current;
        const messageContent = `Bulletin météo horaire pour Lille : 🌡️ ${current.temperature_2m}°C, ☁️ ${current.cloud_cover}% de nuages, 💧 ${current.rain} mm.`;

        const item = {
            id: randomUUID(),
            username: "ScheduledWeatherBot", // Un nom différent pour le distinguer
            content: messageContent,
            timestamp: Date.now()
        };

        const command = new PutCommand({ TableName: TABLE_NAME, Item: item });
        await docClient.send(command);
        
        console.log("Bulletin météo horaire publié avec succès.");
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Post météo créé." }),
        };
    } catch (error) {
        console.error("Erreur lors de la publication du bulletin météo programmé :", error);
        // Il est important de lever une erreur pour qu'EventBridge puisse éventuellement retenter
        throw error;
    }
};