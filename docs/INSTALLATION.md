# Guide d'installation — SwiftLog Livraison Manager

> **Public cible :** Administrateur système / développeur chargé du déploiement.  
> **Environnement cible :** VPS Linux (Ubuntu 22.04 LTS recommandé), 2 vCPU, 4 Go RAM minimum.

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Récupération du code source](#2-récupération-du-code-source)
3. [Configuration de la base de données](#3-configuration-de-la-base-de-données)
4. [Configuration des variables d'environnement](#4-configuration-des-variables-denvironnement)
5. [Construction du backend (JAR)](#5-construction-du-backend-jar)
6. [Construction du frontend (build React)](#6-construction-du-frontend-build-react)
7. [Déploiement du backend comme service systemd](#7-déploiement-du-backend-comme-service-systemd)
8. [Déploiement du frontend avec Nginx](#8-déploiement-du-frontend-avec-nginx)
9. [Certificat SSL avec Let's Encrypt](#9-certificat-ssl-avec-lets-encrypt)
10. [Sauvegarde automatique de la base](#10-sauvegarde-automatique-de-la-base)
11. [Vérification post-déploiement](#11-vérification-post-déploiement)
12. [Déploiement alternatif avec Docker Compose](#12-déploiement-alternatif-avec-docker-compose)
13. [Dépannage courant](#13-dépannage-courant)

---

## 1. Prérequis

Installer les paquets suivants sur le VPS :

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Java 17
sudo apt install -y openjdk-17-jre-headless
java -version   # doit afficher openjdk 17.x

# Maven 3.9 (pour construire le backend sur le serveur, optionnel)
sudo apt install -y maven
mvn -version

# MySQL 8
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation

# Node.js 20 + npm (pour construire le frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # doit afficher v20.x

# Nginx
sudo apt install -y nginx
sudo systemctl enable nginx

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

> [!NOTE]
> Si vous préférez Docker, sautez directement à la [section 12](#12-déploiement-alternatif-avec-docker-compose).

---

## 2. Récupération du code source

```bash
# Cloner le dépôt (remplacez l'URL par votre dépôt Git)
git clone https://github.com/votre-organisation/delivery_system.git /opt/livraison
cd /opt/livraison
```

Si vous déployez depuis une archive ZIP :

```bash
unzip delivery_system.zip -d /opt/livraison
cd /opt/livraison
```

---

## 3. Configuration de la base de données

### 3.1 Créer la base et l'utilisateur MySQL

```bash
sudo mysql -u root -p
```

Dans le shell MySQL :

```sql
CREATE DATABASE livraisonProject CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'livraison_user'@'localhost' IDENTIFIED BY 'VotreMotDePasseDB_Fort!2026';
GRANT ALL PRIVILEGES ON livraisonProject.* TO 'livraison_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> [!IMPORTANT]
> Utilisez un mot de passe fort et unique pour la base de données. Ne réutilisez jamais le mot de passe admin de l'application.

### 3.2 Migrations Flyway (automatiques)

Les migrations SQL sont gérées par **Flyway** et s'exécutent automatiquement au démarrage du backend. Vous n'avez pas à les lancer manuellement. Les fichiers de migration se trouvent dans `backend/src/main/resources/db/migration/`.

---

## 4. Configuration des variables d'environnement

### 4.1 Créer le dossier de configuration

```bash
sudo mkdir -p /etc/livraison
sudo cp /opt/livraison/deploy/env/livraison.env.template /etc/livraison/livraison.env
sudo chmod 600 /etc/livraison/livraison.env
sudo chown root:root /etc/livraison/livraison.env
```

### 4.2 Éditer le fichier de secrets

```bash
sudo nano /etc/livraison/livraison.env
```

Renseigner **toutes** les valeurs suivantes :

```dotenv
# Base de données
DB_URL=jdbc:mysql://localhost:3306/livraisonProject?useUnicode=true&characterEncoding=utf8&serverTimezone=Europe/Paris
DB_USERNAME=livraison_user
DB_PASSWORD=VotreMotDePasseDB_Fort!2026

# Clé secrète JWT (minimum 64 caractères aléatoires)
JWT_SECRET=remplacez-par-une-chaine-aleatoire-de-64-caracteres-minimum-ici-ok

# Origine CORS (votre domaine en production)
CORS_ALLOWED_ORIGINS=https://livraison.votredomaine.com

# Profil Spring
SPRING_PROFILES_ACTIVE=prod

# Sauvegarde base (pour le script backup)
MYSQL_USER=livraison_user
MYSQL_PASSWORD=VotreMotDePasseDB_Fort!2026
MYSQL_DATABASE=livraisonProject
BACKUP_DIR=/var/backups/livraison
RETENTION_DAYS=30
```

> [!CAUTION]
> Ne commitez jamais `/etc/livraison/livraison.env` dans Git. Le `.gitignore` du projet exclut déjà les fichiers `*.env` (sauf les templates).

Pour générer une clé JWT sécurisée :

```bash
openssl rand -base64 64
```

---

## 5. Construction du backend (JAR)

```bash
cd /opt/livraison/backend

# Compiler et packager (skip les tests pour le build de déploiement)
mvn clean package -DskipTests

# Le JAR se trouve dans :
ls target/backend-*.jar
```

Copier le JAR dans le dossier de déploiement :

```bash
sudo mkdir -p /opt/livraison-app
sudo cp target/backend-*.jar /opt/livraison-app/backend.jar
```

---

## 6. Construction du frontend (build React)

```bash
cd /opt/livraison/frontend

# Installer les dépendances
npm ci

# Construire pour la production
npm run build

# Le dossier dist/ contient le build statique
ls dist/
```

Copier le build vers le dossier web Nginx :

```bash
sudo mkdir -p /var/www/livraison
sudo cp -r dist/* /var/www/livraison/
sudo chown -R www-data:www-data /var/www/livraison
```

---

## 7. Déploiement du backend comme service systemd

### 7.1 Créer l'utilisateur système

```bash
sudo useradd -r -s /bin/false livraison
sudo chown livraison:livraison /opt/livraison-app/backend.jar
```

### 7.2 Installer le service

```bash
sudo cp /opt/livraison/deploy/systemd/livraison-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable livraison-backend
sudo systemctl start livraison-backend
```

### 7.3 Vérifier que le service démarre correctement

```bash
sudo systemctl status livraison-backend
# Suivre les logs en temps réel :
sudo journalctl -u livraison-backend -f
```

Au premier démarrage, Flyway exécutera toutes les migrations. Vous devriez voir dans les logs :

```
Successfully applied N migrations to schema `livraisonProject`
Started BackendApplication in X seconds
```

---

## 8. Déploiement du frontend avec Nginx

### 8.1 Installer la configuration Nginx

```bash
sudo cp /opt/livraison/deploy/nginx/livraison.conf /etc/nginx/sites-available/livraison.conf

# Éditer le fichier pour remplacer votredomaine.com par votre vrai domaine
sudo nano /etc/nginx/sites-available/livraison.conf

# Activer le site
sudo ln -s /etc/nginx/sites-available/livraison.conf /etc/nginx/sites-enabled/

# Désactiver le site par défaut (optionnel)
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 9. Certificat SSL avec Let's Encrypt

> [!IMPORTANT]
> Votre domaine doit pointer vers l'IP du VPS **avant** cette étape (enregistrement DNS propagé).

```bash
# Générer le certificat (remplacez le domaine)
sudo certbot --nginx -d livraison.votredomaine.com

# Tester le renouvellement automatique
sudo certbot renew --dry-run
```

Certbot modifiera automatiquement la configuration Nginx pour activer HTTPS. Le renouvellement automatique est configuré via un timer systemd ou cron installé par Certbot.

---

## 10. Sauvegarde automatique de la base

### 10.1 Préparer le dossier de sauvegardes

```bash
sudo mkdir -p /var/backups/livraison
sudo chown livraison:livraison /var/backups/livraison
```

### 10.2 Installer les services de sauvegarde

```bash
sudo cp /opt/livraison/deploy/scripts/backup-db.sh /opt/livraison-app/backup-db.sh
sudo chmod +x /opt/livraison-app/backup-db.sh
sudo chown livraison:livraison /opt/livraison-app/backup-db.sh

sudo cp /opt/livraison/deploy/systemd/livraison-backup.service /etc/systemd/system/
sudo cp /opt/livraison/deploy/systemd/livraison-backup.timer /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now livraison-backup.timer
```

### 10.3 Vérifier la programmation

```bash
sudo systemctl list-timers livraison-backup.timer
# La sauvegarde s'exécute automatiquement tous les jours à 02h00
```

Déclencher une sauvegarde manuelle pour tester :

```bash
sudo systemctl start livraison-backup.service
ls -lh /var/backups/livraison/
```

---

## 11. Vérification post-déploiement

### 11.1 Checklist

| Vérification | Commande / URL |
|---|---|
| Backend en cours d'exécution | `sudo systemctl status livraison-backend` |
| Nginx actif | `sudo systemctl status nginx` |
| API répond | `curl -s https://livraison.votredomaine.com/api/auth/ping` |
| Frontend accessible | Ouvrir `https://livraison.votredomaine.com` dans un navigateur |
| Logs backend | `sudo journalctl -u livraison-backend --since "10 min ago"` |
| Sauvegarde configurée | `sudo systemctl list-timers livraison-backup.timer` |

### 11.2 Première connexion

1. Ouvrir `https://livraison.votredomaine.com`
2. Se connecter avec le compte admin :
   - **Email :** `admin@livraison.com`
   - **Mot de passe :** le mot de passe fort défini dans la migration V2 (`Admin#Prod2026!SecureKey99` par défaut — **à changer immédiatement**)
3. Aller dans **Paramètres → Changer le mot de passe** pour définir un nouveau mot de passe administrateur.

> [!WARNING]
> Changez le mot de passe admin dès la première connexion. Le mot de passe par défaut est connu et doit être remplacé immédiatement en production.

---

## 12. Déploiement alternatif avec Docker Compose

Si vous préférez Docker, tout est pré-configuré.

### Prérequis Docker

```bash
# Installer Docker et Docker Compose
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### Lancer avec Docker Compose

```bash
cd /opt/livraison/deploy

# Copier et remplir le fichier d'environnement
cp env/livraison.env.template env/livraison.env
nano env/livraison.env   # remplir les vraies valeurs

# Construire et démarrer les conteneurs
docker compose up -d --build

# Vérifier que tout tourne
docker compose ps
docker compose logs -f backend
```

Les services exposés :
- **Frontend + Nginx :** port 80 et 443
- **Backend Spring Boot :** port 8080 (interne uniquement)
- **MySQL :** port 3306 (interne uniquement)

> [!TIP]
> Avec Docker, les migrations Flyway s'exécutent au démarrage du conteneur `backend`, exactement comme en mode systemd.

---

## 13. Dépannage courant

### Le backend ne démarre pas

```bash
sudo journalctl -u livraison-backend -n 100 --no-pager
```

Causes fréquentes :
- **`Failed to obtain JDBC Connection`** → MySQL n'est pas démarré ou les credentials sont incorrects dans `/etc/livraison/livraison.env`.
- **`Validate failed: missing table`** → La base n'a pas été créée. Vérifiez l'étape 3.
- **`Port 8080 already in use`** → Un autre processus occupe le port : `sudo lsof -i :8080`.

### Nginx retourne 502 Bad Gateway

Le backend n'est pas encore démarré ou a planté. Vérifier :

```bash
sudo systemctl status livraison-backend
curl -s http://127.0.0.1:8080/api/auth/ping
```

### Erreur SSL / certificat

```bash
sudo certbot renew --dry-run
sudo nginx -t && sudo systemctl reload nginx
```

### Réinitialiser le mot de passe admin via SQL

```bash
# Générer un hash BCrypt en ligne ou avec Java, puis :
sudo mysql -u livraison_user -p livraisonProject
```

```sql
UPDATE users SET password_hash = '$2a$10$NOUVEAU_HASH_BCRYPT' WHERE email = 'admin@livraison.com';
```

### Voir les logs de sauvegarde

```bash
sudo journalctl -u livraison-backup.service
ls -lh /var/backups/livraison/
```
