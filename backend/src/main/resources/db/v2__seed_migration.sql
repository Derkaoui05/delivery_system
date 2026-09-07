INSERT INTO users (id, email, password_hash, role, active, created_at)
VALUES (
           UUID(),
           'admin@livraison.com',
           '$2a$10$r3joLwcC5NEKa5Y8XBRYd.rxL.ZTsdGTGKGlG/i4WhuVSR.JvABbe',
           'ADMIN',
           TRUE,
           NOW()
       );