# Guide : Obtenir les accès API Instagram (Meta)

Suivez ces étapes une seule fois. Cela prend environ 30 minutes.

---

## Prérequis

- Un compte Instagram **Professionnel** ou **Créateur**
- Une **page Facebook** liée à ce compte Instagram

---

## Étape 1 — Créer une application Meta

1. Allez sur **[developers.facebook.com](https://developers.facebook.com)**
2. Cliquez **Mes apps** → **Créer une app**
3. Choisissez le type **"Entreprise"**
4. Donnez un nom (ex: `instagram-auto-publish`) et cliquez **Créer l'app**

---

## Étape 2 — Ajouter le produit Instagram Graph API

1. Dans le tableau de bord de votre app, cliquez **Ajouter un produit**
2. Trouvez **Instagram Graph API** et cliquez **Configurer**
3. Dans le menu gauche, allez dans **Instagram** → **Paramètres de base**

---

## Étape 3 — Connecter votre compte Instagram

1. Dans **Instagram** → **Paramètres de base**, ajoutez votre compte Instagram
2. Autorisez les permissions requises :
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`

---

## Étape 4 — Obtenir votre Instagram Account ID

1. Allez dans l'**Explorateur de l'API Graph** :
   [graph.facebook.com/explorer](https://developers.facebook.com/tools/explorer/)
2. Sélectionnez votre app dans le menu déroulant
3. Dans le champ de requête, entrez :
   ```
   me/accounts
   ```
4. Cliquez **Envoyer**
5. Vous verrez une liste de pages Facebook. Pour chaque page, copiez l'`id`
6. Faites une requête avec l'ID de la page :
   ```
   {PAGE_ID}?fields=instagram_business_account
   ```
7. L'`id` retourné est votre **INSTAGRAM_ACCOUNT_ID** → copiez-le dans `.env`

---

## Étape 5 — Obtenir un token d'accès longue durée

### Token court (1h) → Token long (60 jours)

1. Dans l'Explorateur API Graph, générez un **User Access Token** avec les permissions :
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`

2. Copiez ce token court, puis dans votre terminal :

```bash
curl -X GET \
  "https://graph.facebook.com/v19.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=VOTRE_APP_ID&\
client_secret=VOTRE_APP_SECRET&\
fb_exchange_token=VOTRE_TOKEN_COURT"
```

3. La réponse contient un `access_token` valide **60 jours** → copiez-le dans `.env`

---

## Étape 6 — Renouvellement automatique du token

Le token expire dans 60 jours. Pour renouveler :

```bash
# Relancez simplement cette commande avec le token actuel
curl -X GET \
  "https://graph.facebook.com/v19.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=VOTRE_APP_ID&\
client_secret=VOTRE_APP_SECRET&\
fb_exchange_token=VOTRE_TOKEN_ACTUEL"
```

Mettez à jour `.env` avec le nouveau token.

---

## Étape 7 — Cloudinary (hébergement images)

1. Créez un compte gratuit sur **[cloudinary.com](https://cloudinary.com)**
   (gratuit : 25 GB/mois, largement suffisant)
2. Dans le tableau de bord Cloudinary, copiez :
   - **Cloud name**
   - **API Key**
   - **API Secret**
3. Collez ces valeurs dans `.env`

---

## Vérification finale

Une fois `.env` rempli :

```bash
# Tester la génération d'images (sans publication)
python main.py --test story
python main.py --test carousel
python main.py --test flash

# Tester une publication réelle
python main.py --publish story

# Lancer l'automation complète
python main.py
```

---

## En cas de problème

- **Erreur d'autorisation** : Vérifiez que votre app Meta est en mode **Live** (et non Développement)
- **Token expiré** : Renouvelez avec la commande de l'Étape 6
- **Image non trouvée** : Vérifiez que Cloudinary est correctement configuré
- **Logs** : Consultez `logs/scheduler.log` pour les erreurs détaillées
