import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatetablecomments1745314177816 implements MigrationInterface {
    name = 'Updatetablecomments1745314177816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comment\` CHANGE \`rating\` \`type\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD \`type\` enum ('training', 'skill', 'experience', 'general') NOT NULL DEFAULT 'general'`);
        await queryRunner.query(`ALTER TABLE \`offre\` CHANGE \`status\` \`status\` enum ('accepter', 'en attente') NOT NULL DEFAULT 'en attente'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offre\` CHANGE \`status\` \`status\` enum ('en cours', 'terminé', 'en attente') NOT NULL DEFAULT 'en attente'`);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD \`type\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`comment\` CHANGE \`type\` \`rating\` int NOT NULL`);
    }

}
