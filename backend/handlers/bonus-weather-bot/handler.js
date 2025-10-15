const https = require('https');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const TABLE_NAME = process.env.MESSAGES_TABLE; // À configurer dans la Lambda
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Fonction pour appeler l'API météo
const getWeather = () => {
    return new Promise((resolve, reject) => {
        // URL pour Lille, comme demandé par le sujet 
        const url = "https://api.open-meteo.com/v1/forecast?latitude=50.63&longitude=3.06&current=temperature_2m,cloud_cover,rain";
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', (err) => reject(err));
    });
};

exports.handler = async (event) => {
    try {
        const weatherData = await getWeather();
        const current = weatherData.current;
        
        // Formatage du message comme demandé [cite: 163]
        const messageContent = `Météo pour Lille : 
        🌡️ Température: ${current.temperature_2m}°C, 
        ☁️ Couverture nuageuse: ${current.cloud_cover}%, 
        💧 Risque de pluie: ${current.rain} mm.`;

        const item = {
            id: randomUUID(),
            username: "WeatherBot", // Le nom du bot
            content: messageContent,
            timestamp: Date.now()
        };

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        });

        await docClient.send(command);
        console.log("Message météo posté avec succès !");
        return { statusCode: 200, body: "OK" };

    } catch (error) {
        console.error("Erreur lors de la récupération ou de la publication de la météo :", error);
        return { statusCode: 500, body: "Error" };
    }
};