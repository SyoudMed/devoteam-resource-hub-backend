import { MigrationInterface, QueryRunner } from "typeorm";

export class Addtableintemediare1746005166303 implements MigrationInterface {
    name = 'Addtableintemediare1746005166303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offre\` CHANGE \`requiredSkills\` \`languages\` json NOT NULL`);
        await queryRunner.query(`CREATE TABLE \`offre_skill\` (\`id\` int NOT NULL AUTO_INCREMENT, \`skill_name\` varchar(255) NOT NULL, \`category\` varchar(255) NOT NULL, \`offre_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`offre\` CHANGE \`status\` \`status\` enum ('en cours', 'en attente') NOT NULL DEFAULT 'en attente'`);
        await queryRunner.query(`ALTER TABLE \`offre_skill\` ADD CONSTRAINT \`FK_dfddbb1b096e55bedf694a90aea\` FOREIGN KEY (\`offre_id\`) REFERENCES \`offre\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offre_skill\` DROP FOREIGN KEY \`FK_dfddbb1b096e55bedf694a90aea\``);
        await queryRunner.query(`ALTER TABLE \`offre\` CHANGE \`status\` \`status\` enum ('accepter', 'en attente') NOT NULL DEFAULT 'en attente'`);
        await queryRunner.query(`DROP TABLE \`offre_skill\``);
        await queryRunner.query(`ALTER TABLE \`offre\` CHANGE \`languages\` \`requiredSkills\` json NOT NULL`);
    }

}
