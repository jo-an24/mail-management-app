# Mail Management App

Application de gestion des mails d'entreprise avec React, Node.js, Express et PostgreSQL.

## Fonctionnalités

- 📧 Gestion des mails (réception, envoi, brouillons)
- 🏷️ Étiquettes et dossiers personnalisés
- 🔍 Recherche et filtrage avancés
- 👤 Authentification utilisateur avec JWT
- 📊 Interface moderne et responsive
- 🔐 Sécurité renforcée

## Architecture

```
mail-management-app/
├── backend/          # API Express.js
├── frontend/         # Application React
└── docs/             # Documentation
```

## Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Technologies

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, JWT
- **Database**: PostgreSQL
- **Authentication**: JWT Token

## License

MIT
