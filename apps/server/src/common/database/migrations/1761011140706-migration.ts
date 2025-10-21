import { MigrationInterface, QueryRunner } from 'typeorm';
import { Permission } from '../entities';
import { ROLES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

export class Migration1761011140706 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, create the import permissions
    const importPermissions = [
      { slug: 'import-api-spec', name: 'Import API Spec' },
      { slug: 'list-api-imports', name: 'List API Imports' },
      { slug: 'view-api-import', name: 'View API Import' },
      { slug: 'delete-api-import', name: 'Delete API Import' },
      { slug: 'retry-api-import', name: 'Retry API Import' },
    ];

    await queryRunner.query(
      `INSERT INTO permissions (id, name, slug, description) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [
        importPermissions.map((permission) => [
          uuidv4(),
          permission.name,
          permission.slug,
          '',
        ]),
      ],
    );

    // Now assign permissions to admin roles
    const importPermissionSlugs = importPermissions.map(p => p.slug);

    const admins = await queryRunner.query(
      `SELECT * FROM roles WHERE slug = 'admin' AND parent_id IS NOT NULL`,
    );

    for (const admin of admins) {
      const roots = await queryRunner.query(
        `SELECT * FROM roles WHERE id = ? AND parent_id IS NULL`,
        [admin.parent_id],
      );
      const root = roots[0];
      if (!root) {
        continue;
      }

      // Only add import permissions to API Provider admins
      if (root.slug === ROLES.API_PROVIDER) {
        const permissions = await queryRunner.query(
          `SELECT * FROM permissions WHERE slug IN (?)`,
          [importPermissionSlugs],
        );

        if (permissions.length > 0) {
          // Add permissions to root provider role
          await queryRunner.query(
            `INSERT INTO role_permissions (id, role_id, permission_id) VALUES ? ON DUPLICATE KEY UPDATE id = id`,
            [
              permissions.map((permission: Permission) => [
                uuidv4(),
                root.id,
                permission.id,
              ]),
            ],
          );

          // Add permissions to admin role
          await queryRunner.query(
            `INSERT INTO role_permissions (id, role_id, permission_id) VALUES ? ON DUPLICATE KEY UPDATE id = id`,
            [
              permissions.map((permission: Permission) => [
                uuidv4(),
                admin.id,
                permission.id,
              ]),
            ],
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove import permissions from admin roles
    const importPermissions = [
      'import-api-spec',
      'list-api-imports',
      'view-api-import',
      'delete-api-import',
      'retry-api-import',
    ];

    const permissions = await queryRunner.query(
      `SELECT * FROM permissions WHERE slug IN (?)`,
      [importPermissions],
    );

    if (permissions.length > 0) {
      const permissionIds = permissions.map((p: Permission) => p.id);

      // Remove role assignments
      await queryRunner.query(
        `DELETE FROM role_permissions WHERE permission_id IN (?)`,
        [permissionIds],
      );

      // Remove permissions themselves
      await queryRunner.query(
        `DELETE FROM permissions WHERE id IN (?)`,
        [permissionIds],
      );
    }
  }
}
