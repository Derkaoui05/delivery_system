INSERT INTO users (id, email, password_hash, role, active, created_at)
VALUES (
           UUID(),
           'admin@livraison.com',
           '$2a$10$dSPCNmJhCvCNSoK4rGyFgeWso42jLJDjl4/6QKY2j4NdFe.oMDLuO',
           'ADMIN',
           TRUE,
           NOW()
       );
