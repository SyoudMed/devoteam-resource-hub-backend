import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatetableengineer1743520470844 implements MigrationInterface {
    name = 'Updatetableengineer1743520470844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`reservationStatus\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`reservationStatus\``);
    }

}
