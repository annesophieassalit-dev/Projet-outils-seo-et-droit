# Supabase — ConformiWeb

## Configuration

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez les clés dans Settings > API :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Copiez `.env.example` vers `.env.local` et renseignez les valeurs

## Migrations

Exécutez dans l'ordre dans l'éditeur SQL de Supabase :

```
supabase/migrations/001_schema_initial.sql
supabase/migrations/002_legal_rules_table.sql
```

## Authentification

Dans Authentication > Settings :
- Site URL : `https://votre-domaine.fr`
- Redirect URLs : `https://votre-domaine.fr/api/auth/callback`
- Activez l'envoi d'email de confirmation

## Storage (optionnel pour exports PDF)

Créez un bucket `rapports` (privé) pour stocker les exports PDF des rapports Pro.

## Mise à jour des règles juridiques

Les règles juridiques sont stockées dans la table `legal_rules`.
En tant que juriste, vous pouvez les modifier directement via :
- Le dashboard Supabase (Table Editor)
- Une interface admin dédiée (à développer)
- L'API avec le service role key

Chaque règle a un champ `is_active` pour désactiver une règle sans la supprimer.
