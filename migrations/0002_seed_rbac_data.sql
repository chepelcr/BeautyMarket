-- Migration: Seed RBAC Data
-- Description: Insert default modules, actions, and system roles

-- Insert default actions
INSERT INTO actions (id, name, display_name, description) VALUES
    ('action-create', 'create', 'Crear', 'Permite crear nuevos registros'),
    ('action-read', 'read', 'Leer', 'Permite ver registros'),
    ('action-update', 'update', 'Actualizar', 'Permite modificar registros existentes'),
    ('action-delete', 'delete', 'Eliminar', 'Permite eliminar registros'),
    ('action-export', 'export', 'Exportar', 'Permite exportar datos'),
    ('action-import', 'import', 'Importar', 'Permite importar datos')
ON CONFLICT (name) DO NOTHING;

-- Insert default modules
INSERT INTO modules (id, name, display_name, description, icon, sort_order) VALUES
    ('mod-products', 'products', 'Productos', 'Gestión de catálogo de productos', 'Package', 1),
    ('mod-orders', 'orders', 'Pedidos', 'Gestión de pedidos y ventas', 'ShoppingCart', 2),
    ('mod-customers', 'customers', 'Clientes', 'Gestión de clientes', 'Users', 3),
    ('mod-inventory', 'inventory', 'Inventario', 'Control de stock e inventario', 'Boxes', 4),
    ('mod-analytics', 'analytics', 'Analíticas', 'Reportes y estadísticas', 'BarChart', 5),
    ('mod-marketing', 'marketing', 'Marketing', 'Campañas y promociones', 'Megaphone', 6),
    ('mod-settings', 'settings', 'Configuración', 'Configuración de la tienda', 'Settings', 7),
    ('mod-team', 'team', 'Equipo', 'Gestión de miembros del equipo', 'UserCog', 8),
    ('mod-billing', 'billing', 'Facturación', 'Suscripción y facturación', 'CreditCard', 9)
ON CONFLICT (name) DO NOTHING;

-- Insert submodules for settings
INSERT INTO submodules (id, module_id, name, display_name, description, sort_order) VALUES
    ('sub-settings-general', 'mod-settings', 'general', 'General', 'Configuración general de la tienda', 1),
    ('sub-settings-branding', 'mod-settings', 'branding', 'Marca', 'Logo, colores y personalización', 2),
    ('sub-settings-payment', 'mod-settings', 'payment', 'Pagos', 'Métodos de pago', 3),
    ('sub-settings-shipping', 'mod-settings', 'shipping', 'Envíos', 'Zonas y costos de envío', 4),
    ('sub-settings-domain', 'mod-settings', 'domain', 'Dominio', 'Configuración de dominio personalizado', 5),
    ('sub-settings-notifications', 'mod-settings', 'notifications', 'Notificaciones', 'Configuración de emails y alertas', 6)
ON CONFLICT (module_id, name) DO NOTHING;

-- Insert system roles (no organization_id = system-wide)
INSERT INTO roles (id, organization_id, name, display_name, description, is_system, is_default) VALUES
    ('role-platform-admin', NULL, 'platform_admin', 'Administrador de Plataforma', 'Acceso completo a toda la plataforma', true, false),
    ('role-owner', NULL, 'owner', 'Propietario', 'Propietario de la organización con acceso completo', true, false),
    ('role-admin', NULL, 'admin', 'Administrador', 'Administrador con acceso a la mayoría de funciones', true, false),
    ('role-manager', NULL, 'manager', 'Gerente', 'Gerente con acceso a operaciones diarias', true, false),
    ('role-staff', NULL, 'staff', 'Personal', 'Personal con acceso básico', true, true)
ON CONFLICT DO NOTHING;

-- Grant all permissions to owner role
INSERT INTO role_permissions (role_id, module_id, submodule_id, action_id)
SELECT 'role-owner', m.id, NULL, a.id
FROM modules m
CROSS JOIN actions a
ON CONFLICT DO NOTHING;

-- Grant permissions to admin role (all except billing delete)
INSERT INTO role_permissions (role_id, module_id, submodule_id, action_id)
SELECT 'role-admin', m.id, NULL, a.id
FROM modules m
CROSS JOIN actions a
WHERE NOT (m.name = 'billing' AND a.name = 'delete')
ON CONFLICT DO NOTHING;

-- Grant permissions to manager role
INSERT INTO role_permissions (role_id, module_id, submodule_id, action_id)
SELECT 'role-manager', m.id, NULL, a.id
FROM modules m
CROSS JOIN actions a
WHERE m.name IN ('products', 'orders', 'customers', 'inventory', 'analytics')
ON CONFLICT DO NOTHING;

-- Grant permissions to staff role (read-only + orders management)
INSERT INTO role_permissions (role_id, module_id, submodule_id, action_id)
SELECT 'role-staff', m.id, NULL, a.id
FROM modules m
CROSS JOIN actions a
WHERE (m.name IN ('products', 'customers', 'inventory') AND a.name = 'read')
   OR (m.name = 'orders' AND a.name IN ('read', 'update'))
ON CONFLICT DO NOTHING;
