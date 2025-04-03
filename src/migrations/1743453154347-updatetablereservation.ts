import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatetablereservation1743453154347 implements MigrationInterface {
    name = 'Updatetablereservation1743453154347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` CHANGE \`status\` \`status\` enum ('accepted', 'rejected', 'pending') NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` CHANGE \`status\` \`status\` enum ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING'`);
    }

}
