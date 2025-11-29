# 🏺 MagMate

## 🏗 Architecture & Stack Technique

Le projet est divisé en deux applications distinctes :

### 🎨 Frontend (`magmate-frontend`)
* **Framework** : Angular (v16+)
* **Langage** : TypeScript
* **Styling** : SCSS, CSS natif
* **Build Tool** : Angular CLI (avec configuration Vite présente)

### ⚙️ Backend (`magmate-backend`)
* **Framework** : NestJS
* **Langage** : TypeScript
* **Base de données** : PostgreSQL (Hébergé sur Supabase)
* **ORM** : TypeORM
* **Authentification** : JWT & Firebase Auth
* **Temps réel** : Socket.io
* **Stockage** : Multer (Upload local)

---

## 🚀 Installation et Configuration

### Prérequis
* **Node.js** (v18+ recommandé)
* **PostgreSQL** (Instance locale ou Cloud via Supabase/Neon/AWS)
* **Compte Firebase** (Pour les fonctionnalités avancées d'auth/notifications)

### 1. Configuration du Backend

1.  Accédez au dossier backend et installez les dépendances :
    ```bash
    cd magmate-backend
    npm install
    ```

2.  **Configuration de la Base de Données** :
    Le projet est configuré pour se connecter à une base PostgreSQL.
    
    Créez un fichier `.env` à la racine de `magmate-backend` :
    ```env
    DB_HOST=
    DB_PORT=
    DB_USERNAME=
    DB_PASSWORD=
    DB_DATABASE=
    ```

3.  **Lancer les migrations** (TypeORM migrations) :
    ```bash
    npm run typeorm:run-migrations
    ```

### 2. Configuration du Frontend

1.  Accédez au dossier frontend :
    ```bash
    cd magmate-frontend
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```
---

## 💻 Démarrage (Développement)

Pour lancer le projet complet, vous devez ouvrir deux terminaux séparés.

### Terminal 1 : Backend (NestJS)

```bash
cd magmate-backend

# Lancer en mode développement (avec hot-reload)
npm run start:dev
```
Le serveur démarrera par défaut sur le port 3000

### Terminal 2 : Frontend (Angular)

```bash
cd magmate-frontend

# Lancer le serveur de développement
npm start
```

L'application sera accessible sur http://localhost:4200

---

## 📝 Fonctionnalités Principales

### 🛒 Marketplace & E-commerce
* **Produits** : Consultation, recherche et filtrage de produits artisanaux (Tapis, Bijoux, Céramique...).
* **Boutiques (Magasins)** : Les vendeurs peuvent gérer leur propre boutique.
* **Panier & Commandes** : Gestion du cycle d'achat.

### 📅 Événements
* **Découverte** : Liste des événements culturels (Festivals, Expositions).
* **Favoris** : Possibilité de sauvegarder des événements.

### 🤝 Prestataires & Services
* **Annuaire** : Recherche de prestataires de services.
* **Profils** : Pages détaillées pour les prestataires avec avis et portfolio.

### 💬 Social & Communication
* **Messagerie Instantanée** : Chat en temps réel entre utilisateurs et prestataires (via Socket.io).
* **Avis & Réclamations** : Système de feedback sur les produits et services.

---

## 📂 Structure du Projet

Voici un aperçu de l'organisation des dossiers :

| Dossier | Description |
| :--- | :--- |
| `magmate-frontend/src/app` | Code source Angular (Composants, Services, Modules). |
| `magmate-backend/src` | Code source NestJS (Contrôleurs, Services, Entités). |
| `magmate-backend/uploads` | Dossier de stockage des images uploadées. |
| `magmate-backend/src/migrations` | Scripts de migration de base de données TypeORM. |
