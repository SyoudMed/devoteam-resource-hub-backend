import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatetableengineerandskillsclear1745416060832 implements MigrationInterface {
    name = 'Updatetableengineerandskillsclear1745416060832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`skills\` (\`id\` int NOT NULL AUTO_INCREMENT, \`skill_name\` varchar(255) NOT NULL, \`original_name\` varchar(255) NOT NULL, \`category\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`engineer_skills\` (\`engineer_id\` int NOT NULL, \`skill_id\` int NOT NULL, INDEX \`IDX_cd67fbcdb4b89a03f6b7d707f1\` (\`engineer_id\`), INDEX \`IDX_e523e0e8c61c11dd4776ce99d7\` (\`skill_id\`), PRIMARY KEY (\`engineer_id\`, \`skill_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`engineer_skills\` ADD CONSTRAINT \`FK_cd67fbcdb4b89a03f6b7d707f17\` FOREIGN KEY (\`engineer_id\`) REFERENCES \`engineer\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`engineer_skills\` ADD CONSTRAINT \`FK_e523e0e8c61c11dd4776ce99d75\` FOREIGN KEY (\`skill_id\`) REFERENCES \`skills\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`engineer_skills\` DROP FOREIGN KEY \`FK_e523e0e8c61c11dd4776ce99d75\``);
        await queryRunner.query(`ALTER TABLE \`engineer_skills\` DROP FOREIGN KEY \`FK_cd67fbcdb4b89a03f6b7d707f17\``);
        await queryRunner.query(`DROP INDEX \`IDX_e523e0e8c61c11dd4776ce99d7\` ON \`engineer_skills\``);
        await queryRunner.query(`DROP INDEX \`IDX_cd67fbcdb4b89a03f6b7d707f1\` ON \`engineer_skills\``);
        await queryRunner.query(`DROP TABLE \`engineer_skills\``);
        await queryRunner.query(`DROP TABLE \`skills\``);
    }

}
