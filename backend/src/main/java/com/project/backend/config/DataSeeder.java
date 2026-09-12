package com.project.backend.config;

import com.project.backend.entity.Disponibilite;
import com.project.backend.entity.Fournisseur;
import com.project.backend.entity.Livreur;
import com.project.backend.entity.Role;
import com.project.backend.entity.User;
import com.project.backend.repository.FournisseurRepository;
import com.project.backend.repository.LivreurRepository;
import com.project.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepo;
    private final FournisseurRepository fournisseurRepo;
    private final LivreurRepository livreurRepo;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args){
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(30) NOT NULL");
        } catch (Exception e) {
            System.err.println("Note: could not alter users.role: " + e.getMessage());
        }

        try {
            // Drop any obsolete foreign key constraints pointing to old singular table 'livraison'
            List<Map<String, Object>> obsoleteFks = jdbcTemplate.queryForList(
                    "SELECT TABLE_NAME, CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE " +
                    "WHERE REFERENCED_TABLE_NAME = 'livraison' AND TABLE_SCHEMA = DATABASE()"
            );
            for (Map<String, Object> fk : obsoleteFks) {
                String tableName = (String) fk.get("TABLE_NAME");
                String constraintName = (String) fk.get("CONSTRAINT_NAME");
                try {
                    jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP FOREIGN KEY " + constraintName);
                    System.out.println("Dropped obsolete foreign key " + constraintName + " from " + tableName);
                } catch (Exception ex) {
                    System.err.println("Could not drop fk " + constraintName + ": " + ex.getMessage());
                }
            }
            try {
                jdbcTemplate.execute("DROP TABLE IF EXISTS livraison");
            } catch (Exception ignored) {}
        } catch (Exception e) {
            System.err.println("Note: clean obsolete constraints: " + e.getMessage());
        }

        // 1. Admin seed
        if(!userRepo.existsByEmail("admin@livraison.com")){
            User admin = new User();
            admin.setEmail("admin@livraison.com");
            admin.setPasswordHash(passwordEncoder.encode("admin1234"));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            userRepo.save(admin);
            System.out.println("Seeded admin account : admin@livraison.com / admin1234");
        }

        // 2. Default Fournisseur seed
        if(!userRepo.existsByEmail("fournisseur@livraison.com")){
            User fUser = new User();
            fUser.setEmail("fournisseur@livraison.com");
            fUser.setPasswordHash(passwordEncoder.encode("fournisseur1234"));
            fUser.setRole(Role.FOURNISSEUR);
            fUser.setActive(true);
            userRepo.save(fUser);

            Fournisseur f = new Fournisseur();
            f.setUser(fUser);
            f.setRaisonSociale("Fournisseur Express");
            f.setResponsable("Karim Fournisseur");
            f.setTelephone("0611223344");
            f.setAdresse("Zone Industrielle Sidi Maarouf");
            f.setVille("Casablanca");
            fournisseurRepo.save(f);
            System.out.println("Seeded fournisseur account : fournisseur@livraison.com / fournisseur1234");
        }

        // 3. Default Livreur seed
        if(!userRepo.existsByEmail("livreur@livraison.com")){
            User lUser = new User();
            lUser.setEmail("livreur@livraison.com");
            lUser.setPasswordHash(passwordEncoder.encode("livreur1234"));
            lUser.setRole(Role.LIVREUR);
            lUser.setActive(true);
            userRepo.save(lUser);

            Livreur l = new Livreur();
            l.setUser(lUser);
            l.setNom("Youssef Livreur");
            l.setTelephone("0655667788");
            l.setAdresse("Maarif");
            l.setVille("Casablanca");
            l.setDisponibilite(Disponibilite.DISPONIBLE);
            livreurRepo.save(l);
            System.out.println("Seeded livreur account : livreur@livraison.com / livreur1234");
        }

        // 4. Ensure any existing users with role FOURNISSEUR or LIVREUR have their profile entity created
        for (User u : userRepo.findAll()) {
            if (u.getRole() == Role.FOURNISSEUR && fournisseurRepo.findByUserId(u.getId()).isEmpty()) {
                Fournisseur f = new Fournisseur();
                f.setUser(u);
                String prefix = u.getEmail() != null && u.getEmail().contains("@") ? u.getEmail().split("@")[0] : "fournisseur";
                f.setRaisonSociale("Société " + prefix);
                f.setResponsable(prefix);
                f.setTelephone("0600000000");
                f.setAdresse("Adresse");
                f.setVille("Casablanca");
                fournisseurRepo.save(f);
                System.out.println("Created missing Fournisseur profile for: " + u.getEmail());
            } else if (u.getRole() == Role.LIVREUR && livreurRepo.findByUserId(u.getId()).isEmpty()) {
                Livreur l = new Livreur();
                l.setUser(u);
                String prefix = u.getEmail() != null && u.getEmail().contains("@") ? u.getEmail().split("@")[0] : "livreur";
                l.setNom(prefix);
                l.setTelephone("0600000000");
                l.setAdresse("Adresse");
                l.setVille("Casablanca");
                l.setDisponibilite(Disponibilite.DISPONIBLE);
                livreurRepo.save(l);
                System.out.println("Created missing Livreur profile for: " + u.getEmail());
            }
        }
    }
}
