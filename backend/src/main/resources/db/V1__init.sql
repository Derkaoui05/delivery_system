-- USERS
CREATE TABLE users (
                       id CHAR(36) NOT NULL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role VARCHAR(20) NOT NULL,
                       active BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- FOURNISSEURS
CREATE TABLE fournisseurs (
                              id CHAR(36) NOT NULL PRIMARY KEY,
                              user_id CHAR(36) NOT NULL UNIQUE,
                              raison_sociale VARCHAR(255) NOT NULL,
                              responsable VARCHAR(255) NOT NULL,
                              telephone VARCHAR(30) NOT NULL,
                              adresse VARCHAR(255),
                              ville VARCHAR(100) NOT NULL,
                              CONSTRAINT fk_fournisseur_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- LIVREURS
CREATE TABLE livreurs (
                          id CHAR(36) NOT NULL PRIMARY KEY,
                          user_id CHAR(36) NOT NULL UNIQUE,
                          nom VARCHAR(255) NOT NULL,
                          telephone VARCHAR(30) NOT NULL,
                          adresse VARCHAR(255),
                          ville VARCHAR(100) NOT NULL,
                          disponibilite VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
                          CONSTRAINT fk_livreur_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- CLIENTS
CREATE TABLE clients (
                         id CHAR(36) NOT NULL PRIMARY KEY,
                         nom VARCHAR(255) NOT NULL,
                         telephone VARCHAR(30) NOT NULL,
                         adresse VARCHAR(255) NOT NULL,
                         ville VARCHAR(100) NOT NULL
);
CREATE INDEX idx_clients_telephone ON clients(telephone);

-- LIVRAISONS
CREATE TABLE livraisons (
                            id CHAR(36) NOT NULL PRIMARY KEY,
                            reference VARCHAR(50) NOT NULL UNIQUE,
                            fournisseur_id CHAR(36) NOT NULL,
                            livreur_id CHAR(36),
                            client_id CHAR(36) NOT NULL,
                            description_colis VARCHAR(500),
                            nombre_colis INT,
                            poids_approx DOUBLE,
                            instructions VARCHAR(500),
                            statut VARCHAR(30) NOT NULL DEFAULT 'EN_ATTENTE',
                            date_souhaitee_recuperation DATE,
                            date_souhaitee_livraison DATE,
                            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT fk_livraison_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id),
                            CONSTRAINT fk_livraison_livreur FOREIGN KEY (livreur_id) REFERENCES livreurs(id),
                            CONSTRAINT fk_livraison_client FOREIGN KEY (client_id) REFERENCES clients(id)
);
CREATE INDEX idx_livraisons_statut ON livraisons(statut);
CREATE INDEX idx_livraisons_reference ON livraisons(reference);

-- STATUS HISTORY
CREATE TABLE status_history (
                                id CHAR(36) NOT NULL PRIMARY KEY,
                                livraison_id CHAR(36) NOT NULL,
                                statut VARCHAR(30) NOT NULL,
                                motif_echec VARCHAR(255),
                                changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                CONSTRAINT fk_history_livraison FOREIGN KEY (livraison_id) REFERENCES livraisons(id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
                               id CHAR(36) NOT NULL PRIMARY KEY,
                               livraison_id CHAR(36) NOT NULL,
                               type VARCHAR(30) NOT NULL,
                               message VARCHAR(500) NOT NULL,
                               recipient_user_id CHAR(36) NOT NULL,
                               read_flag BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               CONSTRAINT fk_notification_livraison FOREIGN KEY (livraison_id) REFERENCES livraisons(id),
                               CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id)
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id, read_flag);

