package com.kacheche.audit;

import org.hibernate.envers.RevisionListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class RevisionListenerImpl implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        RevisionInfo revisionInfo = (RevisionInfo) revisionEntity;

        String currentUsername = "ANONYMOUS"; // Valeur par défaut si aucun utilisateur n'est trouvé

        // Récupérer l'authentification depuis Spring Security
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            currentUsername = authentication.getName();
        }

        // Assigner le nom de l'utilisateur connecté à la révision
        revisionInfo.setUsername(currentUsername);
    }
}