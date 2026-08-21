# KLNA Conciergerie CRM

CRM SaaS interne pour la gestion de billets d'événements (concerts, sport, festivals, VIP).

## Stack

- **Next.js 16** (App Router, Server Actions, TypeScript)
- **Tailwind CSS 4** + Shadcn UI + Framer Motion
- **PostgreSQL** (Supabase) + **Prisma ORM**
- **TanStack Table** + React Query + Zustand
- **React Hook Form** + Zod
- **Recharts**

## Démarrage

```bash
# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
# Renseigner DATABASE_URL et DIRECT_URL (Supabase)

# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers Supabase
npm run db:push

# Lancer le serveur de dev
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
├── app/(dashboard)/     # Pages du CRM (dashboard, inventaire, clients…)
├── components/
│   ├── ui/              # Composants Shadcn UI
│   ├── dashboard/       # KPIs, graphiques, alertes livraison
│   ├── inventory/       # Tableau inventaire + calculateur marge
│   └── layout/          # Sidebar, Header
├── data/mock-data.ts    # Données de démo
├── lib/
│   ├── currency.ts      # Multi-devises EUR/USD/AED
│   ├── margin.ts        # Calcul marge nette + split prorata
│   └── prisma.ts        # Client Prisma singleton
└── types/index.ts       # Types TypeScript domaine
prisma/schema.prisma     # Schéma complet avec relations
```

## Règles métier

- **Alerte livraison H-48** : badge rouge clignotant si billet vendu non transféré
- **Split billets** : modèle `TicketBatch` pour répartir les coûts au prorata
- **Multi-devises** : EUR, USD, AED avec conversion pour calcul des marges
