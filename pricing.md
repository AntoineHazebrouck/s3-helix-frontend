### **Chiffrage de la solution serverless sur AWS**

**Groupe :** helix
**Membres du groupe :** Antoine HAZEBROUCK & Axel ELIAS
**Date :** 19 octobre 2025
**Région de référence :** EU (Ireland) - `eu-west-1`

---

## **1. Introduction et Objectif**

Ce document présente une estimation des coûts d'hébergement mensuels sur Amazon Web Services (AWS) pour la solution applicative. L'analyse est basée sur une architecture serverless, reconnue pour sa scalabilité et son optimisation des coûts en fonction de l'usage réel.

L'objectif est de fournir une vision claire et transparente des dépenses prévisionnelles pour trois paliers d'utilisation : **100, 500 et 5 000 utilisateurs actifs mensuels**. Pour chaque palier, nous détaillons les coûts par service, justifions les hypothèses techniques et formulons des recommandations stratégiques.

---

## **2. Hypothèses de Calcul**

Pour garantir la pertinence du chiffrage, les hypothèses suivantes ont été établies.

#### **Comportement des Utilisateurs**

* **Sessions :** Un utilisateur standard effectue en moyenne **2 sessions par mois**.
* **Consultation :** Au cours d'une session, un utilisateur consulte **5 pages** de messages (l'affichage initial des 10 derniers messages, suivi de 4 paginations). Chaque page consultée équivaut à une opération de lecture en base de données.
* **Publication :** Chaque message publié correspond à une opération d'écriture en base de données.

#### **Données et Contenu**

* **Taille des messages :** La taille moyenne d'un message est de **2 Ko**.
* **Contenu statique (Frontend) :** Le stockage sur Amazon S3 pour les fichiers de l'application (HTML, CSS, JavaScript) est fixé à **100 Mo**, un volume constant pour tous les paliers.
* **Transfert de données statiques :** Chaque utilisateur télécharge environ **1 Mo** de données statiques par session.

#### **Hypothèses Techniques**

* **Base de données (Amazon DynamoDB) :**
  * Chaque affichage de page déclenche **une opération de lecture** (*read*).
  * Chaque publication déclenche **une opération d'écriture** (*write*).
* **API (Amazon API Gateway) :**
  * Le type d'API déployé est **REST API**.
  * Un **cache est activé** pour optimiser les performances et réduire les coûts. Nous estimons un **taux de réussite du cache (cache hit) de 50%** pour les opérations de lecture, ce qui signifie que seule la moitié de ces requêtes sollicite le backend (Lambda et DynamoDB).
* **Calcul (AWS Lambda) :**
  * Mémoire allouée par fonction : **512 Mo**.
  * Durée moyenne d'exécution : **100 ms**.
* **Événements (Amazon EventBridge) :**
  * Un événement est généré chaque heure, soit environ **720 événements par mois**.
* **Authentification (Amazon Cognito) :**
  * Les coûts sont calculés sur la base des utilisateurs actifs mensuels (MAU - *Monthly Active Users*).
* **Environnements :**
  * Les calculs se concentrent exclusivement sur l'environnement de **production**. Des environnements supplémentaires (développement, préproduction) généreraient des coûts additionnels.

---

## **3. Chiffrage Détaillé par Palier**

Les estimations sont exprimées en dollars américains (USD) et converties en euros (€) à un taux approximatif de **1 USD = 0,90 €**.

### **Palier 1 : 100 Utilisateurs**

#### **Trafic mensuel estimé**

* **Appels API :** **1 000** (500 lectures après cache + 500 écritures)
* **Opérations DynamoDB :** **1 000 lectures**, **500 écritures**
* **Invocations Lambda :** ~1 720
* **Transfert de données statiques (CloudFront) :** 0,2 Go (inclus dans le *free tier*)

#### **Détail des coûts**

| Service                        | Coût estimé (USD/mois) | Notes                                                     |
| :----------------------------- | :----------------------- | :-------------------------------------------------------- |
| **Amazon Cognito**       | 0,50 $                   | Basé sur 100 MAU.                                        |
| **Amazon S3 (Stockage)** | ~0,002 $                 | Pour 100 Mo de données. Négligeable.                    |
| **Amazon CloudFront**    | 0,00 $                   | Le transfert est inclus dans le*free tier* (1 To/mois). |
| **AWS Lambda**           | ~0,002 $                 | L'usage est couvert par le*free tier*.                  |
| **Amazon API Gateway**   | ~0,004 $                 | Coût pour 1 000 appels. Négligeable.                    |
| **Amazon DynamoDB**      | ~0,001 $                 | En mode **On-Demand**.                             |
| **Amazon EventBridge**   | ~0,10 $                  | Coût forfaitaire estimé.                                |
| **TOTAL**                | **~0,61 $**        |                                                           |

> **Coût total estimé : ~0,55 € / mois**

### **Palier 2 : 500 Utilisateurs**

#### **Trafic mensuel estimé**

* **Appels API :** **5 500** (2 500 lectures après cache + 3 000 écritures)
* **Opérations DynamoDB :** **5 000 lectures**, **3 000 écritures**
* **Invocations Lambda :** ~6 220
* **Transfert de données statiques (CloudFront) :** 1 Go (inclus dans le *free tier*)

#### **Détail des coûts**

| Service                   | Coût estimé (USD/mois) | Notes                                                 |
| :------------------------ | :----------------------- | :---------------------------------------------------- |
| **Amazon Cognito**  | 2,50 $                   | Basé sur 500 MAU.                                    |
| **Autres services** | ~0,13 $                  | Les coûts des autres services restent très faibles. |
| **TOTAL**           | **~2,63 $**        |                                                       |

> **Coût total estimé : ~2,37 € / mois**

### **Palier 3 : 5 000 Utilisateurs**

#### **Trafic mensuel estimé**

* **Appels API :** **75 000** (25 000 lectures après cache + 50 000 écritures)
* **Opérations DynamoDB :** **50 000 lectures**, **50 000 écritures**
* **Invocations Lambda :** ~75 720
* **Transfert de données statiques (CloudFront) :** 10 Go (inclus dans le *free tier*)

#### **Détail des coûts**

| Service                      | Coût estimé (USD/mois) | Notes                                              |
| :--------------------------- | :----------------------- | :------------------------------------------------- |
| **Amazon Cognito**     | 25,00 $                  | Devient le principal poste de coût.               |
| **Amazon API Gateway** | ~0,26 $                  |                                                    |
| **Autres services**    | ~0,18 $                  | Lambda, DynamoDB et EventBridge restent marginaux. |
| **TOTAL**              | **~25,44 $**       |                                                    |

> **Coût total estimé : ~22,90 € / mois**

---

## **4. Analyse et Recommandations Stratégiques**

### **Synthèse des Coûts**

| Palier      | Utilisateurs | Coût estimé (USD/mois) | Coût estimé (€/mois approx.) |
| :---------- | :----------- | :----------------------- | :------------------------------ |
| **1** | 100          | ~0,61 $                  | ~0,55 €                        |
| **2** | 500          | ~2,63 $                  | ~2,37 €                        |
| **3** | 5 000        | ~25,44 $                 | ~22,90 €                       |

### **DynamoDB : On-Demand vs. Provisioned**

Amazon DynamoDB propose deux modes de tarification :

1. **On-Demand :** Paiement à la requête. Idéal pour les trafics imprévisibles, fluctuants ou faibles. **Aucun coût fixe.**
2. **Provisioned :** Réservation d'une capacité fixe (RCU/WCU), payée à l'heure. Plus rentable pour les trafics élevés et prévisibles.

Une simulation pour le palier de **5 000 utilisateurs** en mode **Provisioned** aboutit à un coût d'environ **0,57/mois** ce qui est supérieur au coût du mode **On-Demande (0,075/mois)**. Cela s'explique par le volume de requêtes par seconde qui reste faible.

**Conclusion :** Le mode **On-Demand** est le plus adapté et le plus économique pour tous les paliers étudiés. Il offre une flexibilité totale sans nécessiter de gestion de capacité.

### **Pistes d'Optimisation Future**

Avec l'évolution de l'application et en cas de changements (ajout d'une fonctionnalité pour partager des médias par exemple) alors d'autres pistes seront à explorer ou à revoir afin d'optimiser les coûts.

1. **Utiliser API Gateway HTTP :** Pour des besoins fonctionnels simples, les **API HTTP** sont jusqu'à **70% moins chères** que les API REST. Cette optimisation pourrait réduire significativement les coûts à plus grande échelle.
2. **Améliorer le cache :** Augmenter le taux de réussite du cache de l'API Gateway (> 50%) réduirait encore davantage les sollicitations du backend (Lambda, DynamoDB) et les coûts associés.
3. **Surveiller le transfert de données :** Si l'application venait à distribuer des fichiers volumineux (vidéos, images HD), les frais de sortie de données (*egress*) de CloudFront pourraient devenir un poste de coût majeur une fois le *free tier* dépassé.
4. **Anticiper la croissance :** Si l'application atteint des dizaines de milliers d'utilisateurs, une nouvelle analyse sera nécessaire. Les coûts de services comme Cognito et API Gateway augmenteront linéairement, et le passage à DynamoDB en mode *Provisioned* pourrait alors devenir pertinent.
