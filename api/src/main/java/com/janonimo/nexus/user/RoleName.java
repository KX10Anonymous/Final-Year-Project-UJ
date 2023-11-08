package com.janonimo.nexus.user;

/**
 *
 * @author JANONIMO
 */
public enum RoleName {
    MANAGER, OWNER, GUEST, CLERK;

    public static RoleName fromString(String value) {
        RoleName r = null;
        for (RoleName roleName : RoleName.values()) {
            if (roleName.name().equalsIgnoreCase(value)) {
                r = roleName;
            }
        }
        return r;
    }
}
