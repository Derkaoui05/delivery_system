# Guide utilisateur — SwiftLog Livraison Manager

> **Version :** 1.0 — Novembre 2026  
> Ce guide s'adresse aux trois types d'utilisateurs de la plateforme : l'**administrateur**, les **fournisseurs** et les **livreurs**.

---

## Table des matières

1. [Accès à la plateforme](#1-accès-à-la-plateforme)
2. [Rôle Administrateur](#2-rôle-administrateur)
3. [Rôle Fournisseur](#3-rôle-fournisseur)
4. [Rôle Livreur](#4-rôle-livreur)
5. [Fonctionnalités communes](#5-fonctionnalités-communes)
6. [Questions fréquentes (FAQ)](#6-questions-fréquentes-faq)

---

## 1. Accès à la plateforme

### 1.1 Connexion

1. Ouvrez un navigateur (Chrome, Firefox, Safari, Edge) et accédez à :  
   `https://livraison.votredomaine.com`
2. Saisissez votre **adresse e-mail** et votre **mot de passe**.
3. Cliquez sur **Accéder au portail**.

Vous êtes automatiquement redirigé vers votre espace selon votre rôle.

### 1.2 Mot de passe oublié

1. Sur la page de connexion, cliquez sur **Mot de passe oublié ?**
2. Saisissez votre adresse e-mail professionnelle.
3. Suivez les instructions reçues par e-mail pour réinitialiser votre mot de passe.

> [!NOTE]
> Le lien de réinitialisation est valable 24 heures. Si vous ne recevez pas l'e-mail, vérifiez votre dossier spam.

### 1.3 Changer son mot de passe

Une fois connecté, accédez à **Mon compte → Changer le mot de passe**.  
Le mot de passe doit comporter **au minimum 8 caractères**.

---

## 2. Rôle Administrateur

L'administrateur gère l'ensemble de la plateforme : comptes, livraisons, affectations.

### 2.1 Tableau de bord

Le tableau de bord affiche :
- Le nombre total de livraisons et leur répartition par statut.
- Les livraisons en attente de validation ou d'affectation.
- Les alertes (échecs de livraison, comptes en attente).

### 2.2 Gestion des fournisseurs

| Action | Comment faire |
|--------|--------------|
| Voir la liste des fournisseurs | Menu **Fournisseurs** |
| Activer un compte fournisseur | Cliquer sur **Activer** dans la ligne du fournisseur |
| Désactiver un compte fournisseur | Cliquer sur **Désactiver** — le fournisseur ne peut plus se connecter |
| Voir les livraisons d'un fournisseur | Cliquer sur le nom du fournisseur |

> [!NOTE]
> Un fournisseur désactivé ne peut plus créer de nouvelles livraisons ni se connecter à la plateforme.

### 2.3 Gestion des livreurs

| Action | Comment faire |
|--------|--------------|
| Voir la liste des livreurs | Menu **Livreurs** |
| Activer un compte livreur | Cliquer sur **Activer** dans la ligne du livreur |
| Désactiver un compte livreur | Cliquer sur **Désactiver** — le livreur ne peut plus accepter de missions |

### 2.4 Gestion des livraisons

#### Valider une livraison

1. Depuis le tableau de bord ou le menu **Livraisons**, filtrer sur le statut **En attente de validation**.
2. Cliquer sur la livraison pour voir les détails.
3. Vérifier les informations (adresse, instructions, colis).
4. Cliquer sur **Valider** pour approuver la livraison.  
   → La livraison passe au statut **Validée** et attend l'affectation d'un livreur.

#### Affecter un livreur

1. Depuis la liste des livraisons **Validées**, cliquer sur la livraison.
2. Cliquer sur **Affecter un livreur**.
3. Sélectionner un livreur disponible dans la liste déroulante.
4. Confirmer l'affectation.  
   → La livraison passe au statut **Affectée** et le livreur reçoit une notification.

#### Suivre les livraisons en cours

- Le tableau de bord affiche toutes les livraisons par statut.
- Cliquer sur une livraison pour voir son historique complet (chronologie des changements de statut).

#### Traiter un échec de livraison

Si un livreur signale un échec :
1. La livraison apparaît avec le statut **Échec de livraison** et le motif indiqué par le livreur.
2. L'administrateur peut décider de :
   - **Réaffecter** la livraison à un autre livreur.
   - Contacter le fournisseur pour obtenir des informations complémentaires.
   - **Annuler** la livraison si nécessaire.

### 2.5 Statistiques

Le menu **Statistiques** affiche :
- Le nombre de livraisons par période (jour, semaine, mois).
- Le taux de livraison réussie.
- La performance par livreur.

---

## 3. Rôle Fournisseur

Le fournisseur crée des demandes de livraison et suit leur progression.

### 3.1 Créer une demande de livraison

1. Depuis le tableau de bord, cliquer sur **Nouvelle livraison** (ou le bouton **+**).
2. Remplir le formulaire :

| Champ | Description |
|-------|-------------|
| **Adresse de retrait** | Adresse où le colis doit être récupéré |
| **Adresse de livraison** | Adresse du destinataire |
| **Nom du destinataire** | Nom complet |
| **Téléphone du destinataire** | Numéro de contact |
| **Description du colis** | Nature et contenu du colis |
| **Instructions de livraison** | Instructions spéciales pour le livreur (code d'accès, étage…) |
| **Commentaire** | Remarques internes |

3. Cliquer sur **Créer la livraison**.  
   → La livraison est créée avec le statut **En attente de validation** et une référence unique est générée automatiquement (ex. : `LIV-2026-00042`).

### 3.2 Suivre mes livraisons

Le tableau de bord affiche toutes vos livraisons avec leur statut actuel :

| Statut | Signification |
|--------|--------------|
| 🟡 **En attente de validation** | La livraison est en cours d'examen par l'administrateur |
| 🔵 **Validée** | Approuvée, en attente d'affectation à un livreur |
| 🟣 **Affectée** | Un livreur a été désigné |
| 🟠 **En cours de récupération** | Le livreur est en route pour récupérer le colis |
| 🔷 **Récupérée** | Le colis est pris en charge par le livreur |
| 🟢 **Livrée** | Livraison effectuée avec succès |
| 🔴 **Échec de livraison** | Tentative échouée (motif indiqué) |
| ⚫ **Annulée** | Livraison annulée |

Cliquer sur une livraison pour voir :
- Le **détail complet** (adresses, colis, instructions).
- La **chronologie** des changements de statut avec les horodatages.
- Le **motif d'échec** si applicable.

### 3.3 Notifications

Vous recevez des notifications automatiques lorsque :
- Votre livraison est validée ou refusée.
- Un livreur est affecté.
- La livraison est récupérée ou livrée.
- Un échec est signalé.

> [!TIP]
> Les notifications sont accessibles via l'icône 🔔 en haut à droite de la page.

### 3.4 Isolation des données

Vous ne voyez que **vos propres livraisons**. Vous n'avez pas accès aux livraisons des autres fournisseurs.

---

## 4. Rôle Livreur

Le livreur consulte ses missions et met à jour le statut des livraisons.

> [!TIP]
> L'interface livreur est optimisée pour **mobile**. Utilisez votre smartphone pour une meilleure expérience sur le terrain.

### 4.1 Voir mes missions

Après connexion, le tableau de bord affiche uniquement les livraisons qui vous sont affectées.

Vous pouvez filtrer par statut pour retrouver rapidement :
- Les missions **en attente** (affectées mais pas encore commencées).
- Les missions **en cours**.
- L'**historique** des missions terminées.

### 4.2 Parcours normal d'une livraison

Voici les étapes à suivre pour chaque livraison affectée :

#### Étape 1 — En route pour récupérer le colis

1. Trouver la livraison dans votre liste de missions.
2. Cliquer sur **En route pour récupération**.  
   → Statut : **En cours de récupération**

#### Étape 2 — Colis récupéré

1. Arrivé chez le fournisseur / au point de retrait.
2. Cliquer sur **Colis récupéré**.  
   → Statut : **Récupérée**

#### Étape 3 — Livraison effectuée

1. Une fois le colis remis au destinataire.
2. Cliquer sur **Livraison effectuée**.  
   → Statut : **Livrée** ✅

### 4.3 Signaler un échec de livraison

Si la livraison n'a pas pu être effectuée (destinataire absent, adresse incorrecte, etc.) :

1. Depuis le détail de la livraison, cliquer sur **Signaler un échec**.
2. **Saisir obligatoirement le motif** de l'échec (destinataire absent, adresse introuvable, colis refusé, etc.).
3. Confirmer.  
   → Statut : **Échec de livraison** — L'administrateur est notifié et prendra en charge la suite.

> [!IMPORTANT]
> Le motif d'échec est **obligatoire**. La plateforme ne permet pas de signaler un échec sans explication.

### 4.4 Voir le détail d'une livraison

Cliquer sur une livraison pour accéder à :
- L'**adresse de retrait** et l'**adresse de livraison** (avec lien vers Google Maps).
- Le **nom et téléphone** du destinataire.
- Les **instructions de livraison** spéciales.
- La **description du colis**.

### 4.5 Notifications

Vous recevez des notifications lorsque :
- Une nouvelle livraison vous est affectée.
- Des informations importantes concernant une mission sont mises à jour.

---

## 5. Fonctionnalités communes

### 5.1 Changer son mot de passe

1. Cliquer sur votre nom / avatar en haut à droite.
2. Sélectionner **Mon compte** ou **Paramètres**.
3. Remplir les champs **Ancien mot de passe**, **Nouveau mot de passe** et **Confirmer**.
4. Valider.

> [!NOTE]
> Le nouveau mot de passe doit faire **au minimum 8 caractères**.

### 5.2 Déconnexion

Cliquer sur votre nom en haut à droite → **Se déconnecter**.  
Votre session est immédiatement invalidée côté serveur.

### 5.3 Référence de livraison

Chaque livraison reçoit une référence unique au format `LIV-AAAA-NNNNN` (ex. : `LIV-2026-00042`).  
Cette référence est invariable et peut être utilisée pour retrouver rapidement une livraison par téléphone ou e-mail.

---

## 6. Questions fréquentes (FAQ)

**Q : Je n'arrive pas à me connecter. Que faire ?**  
R : Vérifiez que vous utilisez la bonne adresse e-mail et le bon mot de passe. Si vous avez oublié votre mot de passe, utilisez le lien **Mot de passe oublié ?**. Si votre compte a été désactivé par l'administrateur, contactez-le directement.

---

**Q : Ma livraison est bloquée en « En attente de validation ». Pourquoi ?**  
R : L'administrateur doit valider manuellement chaque nouvelle demande de livraison. Si cela prend plus d'une journée ouvrable, contactez l'administrateur.

---

**Q : Je suis fournisseur. Puis-je modifier une livraison après sa création ?**  
R : Non. Une fois la livraison créée, seul l'administrateur peut la modifier. Contactez-le si une correction est nécessaire.

---

**Q : Je suis livreur. Comment voir l'adresse sur une carte ?**  
R : Dans le détail de la livraison, cliquez sur l'adresse pour ouvrir Google Maps (ou Apple Maps sur iPhone) avec l'itinéraire pré-rempli.

---

**Q : Que se passe-t-il si je sélectionne « Échec » par erreur ?**  
R : Contactez immédiatement l'administrateur. Il peut remettre la livraison dans un état précédent et vous réaffecter la mission.

---

**Q : Mes données sont-elles sécurisées ?**  
R : Oui. La communication est chiffrée via HTTPS/TLS. Vos mots de passe sont stockés de façon sécurisée (hachage BCrypt). Chaque utilisateur n'a accès qu'à ses propres données.

---

*Pour toute question technique, contactez l'administrateur système. Pour toute question fonctionnelle, contactez votre responsable logistique.*
