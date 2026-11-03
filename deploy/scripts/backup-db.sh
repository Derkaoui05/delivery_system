#!/bin/bash
# ==============================================================================
# Script de sauvegarde automatique de la base de données MySQL - Livraison Manager
# ==============================================================================
# Ce script réalise un dump cohérent, compressé, horodaté et applique une rotation
# automatique des archives (rétention par défaut : 7 jours).
# ==============================================================================

set -euo pipefail

# --- Configuration (remplacer par des variables d'environnement si souhaité) ---
BACKUP_DIR="${BACKUP_DIR:-/var/backups/livraison_mysql}"
DB_NAME="${DB_NAME:-livraisonProject}"
DB_USER="${DB_USER:-livraison_user}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

DATE_TAG=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE_TAG}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Création du répertoire de sauvegarde s'il n'existe pas
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

log_msg() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log_msg "--- Début de la sauvegarde de la base '${DB_NAME}' ---"

# Export MySQL avec mysqldump (transaction cohérente pour InnoDB sans bloquer les écritures)
if [ -n "${DB_PASSWORD}" ]; then
    MYSQL_PWD="${DB_PASSWORD}" mysqldump \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --user="${DB_USER}" \
        --single-transaction \
        --quick \
        --routines \
        --triggers \
        "${DB_NAME}" | gzip > "${BACKUP_FILE}"
else
    # Si authentification par socket local (auth_socket sous Linux root)
    mysqldump \
        --single-transaction \
        --quick \
        --routines \
        --triggers \
        "${DB_NAME}" | gzip > "${BACKUP_FILE}"
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log_msg "Sauvegarde réussie : ${BACKUP_FILE} (Taille : ${FILE_SIZE})"

# --- Rotation des anciennes sauvegardes (> RETENTION_DAYS jours) ---
log_msg "Nettoyage des sauvegardes datant de plus de ${RETENTION_DAYS} jours..."
find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -print -delete | tee -a "${LOG_FILE}"

log_msg "--- Fin du traitement de sauvegarde ---"

