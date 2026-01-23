
FROM node:20 AS frontend-builder
WORKDIR /app/frontend

# Installation des dépendances Frontend
COPY magmate-frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# Copie du code source et build de production
COPY magmate-frontend/ ./
# Génère les fichiers dans /app/frontend/dist/magmate-frontend/browser
RUN npm run build -- --configuration production


FROM node:20 AS backend-builder
WORKDIR /app/backend

# Installation des dépendances Backend 
COPY magmate-backend/package*.json ./
RUN npm ci

# Copie du code source et compilation TypeScript -> JS
COPY magmate-backend/ ./
RUN npm run build
# Le résultat compilé se trouve dans /app/backend/dist


FROM node:20-slim

WORKDIR /app

# Installation des dépendances de PROD 
COPY magmate-backend/package*.json ./
RUN npm ci --omit=dev

COPY magmate-backend/firebase-service-account.json ./

# Récupération du Backend compilé 
COPY --from=backend-builder /app/backend/dist ./dist

# Récupération du Frontend compilé
COPY --from=frontend-builder /app/frontend/dist/magmate-frontend/browser ./static

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposition du port
EXPOSE 3000

# Démarrage du serveur
CMD ["node", "dist/main.js"]