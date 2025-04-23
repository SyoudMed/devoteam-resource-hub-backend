import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatetableengineer1745398933288 implements MigrationInterface {
    name = 'Updatetableengineer1745398933288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`skill\` (\`id\` int NOT NULL AUTO_INCREMENT, \`skill_name\` varchar(255) NOT NULL, \`original_name\` varchar(255) NOT NULL, \`category\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`engineer_skills_skill\` (\`engineerId\` int NOT NULL, \`skillId\` int NOT NULL, INDEX \`IDX_9dd7a13c1d240aa8d955177ae8\` (\`engineerId\`), INDEX \`IDX_71e4a16ab5c999f7784bc03fbc\` (\`skillId\`), PRIMARY KEY (\`engineerId\`, \`skillId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP COLUMN \`skills\``);
        await queryRunner.query(`ALTER TABLE \`engineer_skills_skill\` ADD CONSTRAINT \`FK_9dd7a13c1d240aa8d955177ae85\` FOREIGN KEY (\`engineerId\`) REFERENCES \`engineer\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`engineer_skills_skill\` ADD CONSTRAINT \`FK_71e4a16ab5c999f7784bc03fbcc\` FOREIGN KEY (\`skillId\`) REFERENCES \`skill\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`engineer_skills_skill\` DROP FOREIGN KEY \`FK_71e4a16ab5c999f7784bc03fbcc\``);
        await queryRunner.query(`ALTER TABLE \`engineer_skills_skill\` DROP FOREIGN KEY \`FK_9dd7a13c1d240aa8d955177ae85\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD \`skills\` json NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_71e4a16ab5c999f7784bc03fbc\` ON \`engineer_skills_skill\``);
        await queryRunner.query(`DROP INDEX \`IDX_9dd7a13c1d240aa8d955177ae8\` ON \`engineer_skills_skill\``);
        await queryRunner.query(`DROP TABLE \`engineer_skills_skill\``);
        await queryRunner.query(`DROP TABLE \`skill\``);
    }

}
