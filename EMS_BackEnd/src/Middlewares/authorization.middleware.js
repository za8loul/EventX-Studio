import { ROLES, PERMISSIONS } from "../DB/Models/users.model.js";

// Middleware to check if user has a specific role
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.loggedInUser) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userRole = req.loggedInUser.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
            });
        }

        next();
    };
};

// Middleware to check if user has a specific permission
export const requirePermission = (permissions) => {
    return (req, res, next) => {
        if (!req.loggedInUser) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const user = req.loggedInUser.user;
        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

        for (const permission of requiredPermissions) {
            if (!user.hasPermission(permission)) {
                return res.status(403).json({ 
                    message: `Access denied. Required permission: ${permission}` 
                });
            }
        }

        next();
    };
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
    if (!req.loggedInUser) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (!req.loggedInUser.user.isAdmin()) {
        return res.status(403).json({ message: "Admin access required" });
    }

    next();
};

// Convenience middleware for common role checks
export const requireUser = requireRole(ROLES.USER);
export const requireAdminRole = requireRole(ROLES.ADMIN);
