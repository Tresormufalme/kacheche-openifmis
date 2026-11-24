package com.kacheche.security;

import com.kacheche.entity.Role;
import com.kacheche.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

/**
 * Utilisateur authentifié tel que vu par Spring Security.
 * Autorités : ROLE_<NOM> pour chaque rôle + chaque code de permission.
 */
public class AppUserDetails implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final String fullName;
    private final String email;
    private final boolean enabled;
    private final boolean locked;
    private final boolean mustChangePassword;
    private final List<String> roles;
    private final Set<String> permissions;
    private final List<GrantedAuthority> authorities;

    private AppUserDetails(User user) {

        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.enabled = user.isEnabled();
        this.locked = user.isLocked();
        this.mustChangePassword = user.isMustChangePassword();

        this.roles = user.getRoles().stream()
                .map(Role::getName)
                .sorted(Comparator.naturalOrder())
                .toList();

        this.permissions = new TreeSet<>();
        user.getRoles().forEach(role -> this.permissions.addAll(role.getPermissions()));

        List<GrantedAuthority> granted = new ArrayList<>();
        this.roles.forEach(role -> granted.add(new SimpleGrantedAuthority("ROLE_" + role)));
        this.permissions.forEach(code -> granted.add(new SimpleGrantedAuthority(code)));
        this.authorities = List.copyOf(granted);
    }

    // À appeler dans une transaction (les rôles sont chargés à la demande).
    public static AppUserDetails from(User user) {
        return new AppUserDetails(user);
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public boolean isMustChangePassword() { return mustChangePassword; }
    public List<String> getRoles() { return roles; }
    public Set<String> getPermissions() { return permissions; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return username; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return !locked; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return enabled; }
}
