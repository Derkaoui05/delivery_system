INSERT INTO users (id, email, password_hash, role, active, created_at)
VALUES (
           UUID(),
           'admin@livraison.com',
           '$2a$10$X8mR0fP10Jp2mF8aL6.pBeL56FwVkWt96pYxO7Pz1p9n8K7y7bFzO',
           'ADMIN',
           TRUE,
           NOW()
       );
