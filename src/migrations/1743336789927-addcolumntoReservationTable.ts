import { MigrationInterface, QueryRunner } from "typeorm";

export class AddcolumntoReservationTable1743336789927 implements MigrationInterface {
    name = 'AddcolumntoReservationTable1743336789927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`duration\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`duration\``);
    }

}
