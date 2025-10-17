# 🚀 S3 Helix Backend

Backend serverless pour l'application S3 Helix, construit avec AWS SAM (Serverless Application Model).

## 📋 Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [API Endpoints](#api-endpoints)
- [Fonctions Lambda](#fonctions-lambda)
- [Variables d'environnement](#variables-denvironnement)
- [Tests locaux](#tests-locaux)
- [Structure du projet](#structure-du-projet)

## 🏗️ Architecture

L'application utilise les services AWS suivants :

- **API Gateway** : API REST pour les endpoints HTTP
- **Lambda Functions** : 4 fonctions pour gérer la logique métier
- **DynamoDB** : Base de données NoSQL pour stocker les messages
- **S3** : Hébergement du frontend statique
- **CloudFront** : CDN pour la distribution du frontend
- **DynamoDB Streams** : Déclenchement des bots en temps réel

### Schéma d'architecture

```
┌─────────────┐
│  CloudFront │
│     CDN     │
└──────┬──────┘
       │
┌──────▼──────┐
│  S3 Bucket  │
│  (Frontend) │
└─────────────┘

┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Client    │─────▶│  API Gateway     │─────▶│   Lambda    │
│  (Browser)  │      │  /messages (GET) │      │ GetMessages │
└─────────────┘      │  /messages (POST)│      │ PostMessage │
                     └──────────────────┘      └──────┬──────┘
                                                       │
                     ┌──────────────────┐      ┌──────▼──────┐
                     │  DynamoDB        │◀─────│  DynamoDB   │
                     │  Messages Table  │      │   Streams   │
                     └──────────────────┘      └──────┬──────┘
                                                       │
                                          ┌────────────┴─────────────┐
                                          │                          │
                                   ┌──────▼──────┐          ┌───────▼────────┐
                                   │   Lambda    │          │    Lambda      │
                                   │  AutoReply  │          │  WeatherBot    │
                                   └─────────────┘          └────────────────┘
```

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 18.x ou 20.x)
- [AWS CLI](https://aws.amazon.com/cli/) configuré avec vos credentials
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Un compte AWS actif

### Installation des outils

```bash
# Installer AWS CLI
# Windows (avec chocolatey)
choco install awscli

# Installer SAM CLI
# Windows (avec chocolatey)
choco install aws-sam-cli

# Vérifier les installations
aws --version
sam --version
node --version
```

### Configuration AWS

```bash
# Configurer vos credentials AWS
aws configure

# Vous devrez fournir :
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (ex: eu-west-1)
# - Default output format (json)
```

## 📦 Installation

1. **Cloner le repository**

```bash
git clone https://github.com/AntoineHazebrouck/s3-helix-frontend.git
cd s3-helix-frontend/backend
```

2. **Installer les dépendances de chaque handler**

```bash
# Messages handler
cd handlers/messages
npm install
cd ../..

# Auto Reply handler
cd handlers/bonus-auto-reply
npm install
cd ../..

# Weather Bot handler
cd handlers/bonus-weather-bot
npm install
cd ../..
```

## 🚀 Déploiement

### Déploiement complet

```bash
# 1. Builder l'application SAM
sam build

# 2. Déployer (première fois - mode guidé)
sam deploy --guided

# Les déploiements suivants
sam deploy
```

### Paramètres du déploiement guidé

Lors du premier déploiement, vous serez invité à fournir :

- **Stack Name** : `s3-helix-backend` (ou votre choix)
- **AWS Region** : `eu-west-1` (ou votre région préférée)
- **Confirm changes before deploy** : Y
- **Allow SAM CLI IAM role creation** : Y
- **Save arguments to configuration file** : Y

### Déploiement rapide (après la première fois)

```bash
sam build && sam deploy
```

## 🌐 API Endpoints

Une fois déployé, votre API sera accessible via l'URL fournie dans les outputs.

### GET /messages

Récupère tous les messages.

**Request:**
```bash
curl https://YOUR-API-ID.execute-api.REGION.amazonaws.com/Prod/messages
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid-1234",
      "timestamp": 1697500800,
      "author": "John Doe",
      "content": "Hello World!",
      "avatar": "https://..."
    }
  ]
}
```

### POST /messages

Crée un nouveau message.

**Request:**
```bash
curl -X POST https://YOUR-API-ID.execute-api.REGION.amazonaws.com/Prod/messages \
  -H "Content-Type: application/json" \
  -d '{
    "author": "John Doe",
    "content": "Hello World!",
    "avatar": "https://..."
  }'
```

**Response:**
```json
{
  "message": "Message posted successfully",
  "id": "uuid-1234",
  "timestamp": 1697500800
}
```

## 🤖 Fonctions Lambda

### 1. GetMessagesFunction

**Handler:** `handlers/messages/get-messages.js`

Récupère les messages depuis DynamoDB avec pagination et tri par timestamp.

**Permissions:** DynamoDBReadPolicy

### 2. PostMessageFunction

**Handler:** `handlers/messages/post-message.js`

Crée un nouveau message dans DynamoDB avec génération automatique d'ID et timestamp.

**Permissions:** DynamoDBCrudPolicy

### 3. AutoReplyFunction

**Handler:** `handlers/bonus-auto-reply/handler.js`

Bot qui répond automatiquement aux nouveaux messages via DynamoDB Streams.

**Trigger:** DynamoDB Stream (nouveau message)

**Permissions:** DynamoDBCrudPolicy

### 4. WeatherBotFunction

**Handler:** `handlers/bonus-weather-bot/handler.js`

Bot météo qui détecte les questions sur la météo et répond avec les prévisions.

**Trigger:** DynamoDB Stream (nouveau message)

**Permissions:** DynamoDBCrudPolicy

**Variables d'environnement requises:**
- `WEATHER_API_KEY` : Clé API pour le service météo (ex: OpenWeatherMap)

## 🔐 Variables d'environnement

Les variables d'environnement sont définies dans `template.yaml` :

```yaml
Environment:
  Variables:
    MESSAGES_TABLE: !Ref MessagesTable  # Nom de la table DynamoDB
    CORS_ORIGIN: '*'                     # Origine CORS autorisée
    WEATHER_API_KEY: '${WEATHER_API_KEY}' # Clé API météo (pour WeatherBot)
```

### Configurer la clé API météo

```bash
# Ajouter la variable d'environnement dans AWS Lambda Console
# OU via AWS CLI
aws lambda update-function-configuration \
  --function-name s3-helix-backend-WeatherBotFunction-XXXXX \
  --environment Variables={WEATHER_API_KEY=your_api_key_here}
```

## 🧪 Tests locaux

### Démarrer l'API localement

```bash
# Démarrer API Gateway et Lambda localement
sam local start-api

# L'API sera disponible sur http://localhost:3000
```

### Tester les endpoints localement

```bash
# GET messages
curl http://localhost:3000/messages

# POST message
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"author":"Test","content":"Local test","avatar":"https://..."}'
```

### Invoquer une fonction spécifique

```bash
# Invoquer GetMessagesFunction
sam local invoke GetMessagesFunction

# Invoquer avec un event personnalisé
sam local invoke PostMessageFunction -e events/post-message.json
```

### Créer un event de test

Créez un fichier `events/post-message.json` :

```json
{
  "httpMethod": "POST",
  "body": "{\"author\":\"Test User\",\"content\":\"Test message\",\"avatar\":\"https://test.com/avatar.jpg\"}"
}
```

## 📁 Structure du projet

```
backend/
├── template.yaml                  # Template SAM (infrastructure as code)
├── README.md                      # Ce fichier
├── samconfig.toml                # Configuration SAM (généré après deploy)
├── handlers/
│   ├── messages/
│   │   ├── get-messages.js       # Handler GET /messages
│   │   ├── post-message.js       # Handler POST /messages
│   │   ├── package.json          # Dépendances
│   │   └── node_modules/
│   ├── bonus-auto-reply/
│   │   ├── handler.js            # Bot de réponse automatique
│   │   ├── package.json
│   │   └── node_modules/
│   └── bonus-weather-bot/
│       ├── handler.js            # Bot météo
│       ├── package.json
│       └── node_modules/
└── events/                       # Events de test (à créer)
    └── *.json
```

## 📊 Monitoring et Logs

### Visualiser les logs CloudWatch

```bash
# Logs en temps réel pour une fonction
sam logs -n GetMessagesFunction --stack-name s3-helix-backend --tail

# Logs des dernières 10 minutes
sam logs -n GetMessagesFunction --stack-name s3-helix-backend --start-time '10min ago'
```

### CloudWatch Console

Accédez aux logs dans la console AWS :
1. AWS Console > CloudWatch > Log groups
2. Rechercher `/aws/lambda/s3-helix-backend-*`

## 🗑️ Suppression de la stack

Pour supprimer complètement l'application :

```bash
# Supprimer la stack CloudFormation
aws cloudformation delete-stack --stack-name s3-helix-backend

# OU avec SAM
sam delete --stack-name s3-helix-backend
```

**⚠️ Attention:** Cela supprimera toutes les ressources, y compris la table DynamoDB et ses données !

## 🔧 Debugging

### Problèmes courants

**1. Erreur de permissions**
```bash
# Vérifier les policies IAM dans template.yaml
# Assurez-vous que les fonctions ont les bonnes permissions
```

**2. CORS errors**
```bash
# Vérifier la configuration CORS dans template.yaml
# Modifier CORS_ORIGIN dans les variables d'environnement
```

**3. DynamoDB access denied**
```bash
# Vérifier que MESSAGES_TABLE est bien passée en variable d'environnement
# Vérifier les policies DynamoDB dans template.yaml
```

## 📝 Bonnes pratiques

1. **Sécurité**
   - Ne jamais commiter les credentials AWS
   - Utiliser AWS Secrets Manager pour les clés API sensibles
   - Restreindre CORS en production (`CORS_ORIGIN: 'https://votre-domaine.com'`)

2. **Performance**
   - Activer la mise en cache API Gateway pour réduire les coûts
   - Utiliser les indexes secondaires DynamoDB si nécessaire
   - Configurer les reserved concurrency pour les fonctions critiques

3. **Coûts**
   - Utiliser le mode PAY_PER_REQUEST pour DynamoDB (petite échelle)
   - Monitorer les invocations Lambda via CloudWatch
   - Configurer des budgets AWS pour éviter les surprises

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- **Antoine Hazebrouck** - [AntoineHazebrouck](https://github.com/AntoineHazebrouck)

## 🔗 Liens utiles

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)

---

**Made with ❤️ for IMT Cloud & DevOps Project**
