import { MigrationInterface, QueryRunner } from 'typeorm';
import { Permission } from '../entities';
import {
  CONSUMER_PERMISSIONS,
  PROVIDER_PERMISSIONS,
} from '../../../permissions/types';
import { ROLES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

export class Migration1701856285972 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const admins = await queryRunner.query(
      `SELECT * FROM roles WHERE slug = 'admin' AND parent_id IS NOT NULL`,
    );
    for (const admin of admins) {
      const roots = await queryRunner.query(
        `SELECT * FROM roles WHERE id = ? AND parent_id IS NULL`,
        [admin.parent_id],
      );
      const root = roots[0];
      console.log({ admin, root });
      if (!root) {
        continue;
      }
      console.log('continuinngngn', root.slug);
      if (root.slug === ROLES.API_CONSUMER) {
        const permissions = await queryRunner.query(
          `SELECT * FROM permissions WHERE slug IN (?)`,
          [Object.values(CONSUMER_PERMISSIONS)],
        );
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
      } else if (root.slug === ROLES.API_PROVIDER) {
        const permissions = await queryRunner.query(
          `SELECT * FROM permissions WHERE slug IN (?)`,
          [Object.values(PROVIDER_PERMISSIONS)],
        );
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

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
