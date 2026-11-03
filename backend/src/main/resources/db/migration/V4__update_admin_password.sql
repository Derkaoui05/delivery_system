-- V4: Mise à jour du mot de passe administrateur par défaut vers un mot de passe fort
UPDATE users
SET password_hash = '$2a$10$dSPCNmJhCvCNSoK4rGyFgeWso42jLJDjl4/6QKY2j4NdFe.oMDLuO'
WHERE email = 'admin@livraison.com';

