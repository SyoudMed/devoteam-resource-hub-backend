import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatetableengineer1743770431342 implements MigrationInterface {
    name = 'Updatetableengineer1743770431342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`CvUrl\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`CvUrl\``);
    }

}
