import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatetableengineer1743713173948 implements MigrationInterface {
    name = 'Updatetableengineer1743713173948'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`total_experience_year\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`languages\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`poste\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`skills\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`formations\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`experience\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP FOREIGN KEY \`FK_8d9c64597951e26c9632bf8c7ad\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`speciality\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`speciality\` enum ('Developer', 'DevOps', 'Cyber Security', 'Data') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` CHANGE \`userId\` \`userId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD CONSTRAINT \`FK_8d9c64597951e26c9632bf8c7ad\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP FOREIGN KEY \`FK_8d9c64597951e26c9632bf8c7ad\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`speciality\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`speciality\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD CONSTRAINT \`FK_8d9c64597951e26c9632bf8c7ad\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`experience\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`formations\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`skills\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`poste\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`languages\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`total_experience_year\``);
    }

}
