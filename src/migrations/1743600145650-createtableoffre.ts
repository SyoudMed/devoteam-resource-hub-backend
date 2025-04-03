import { MigrationInterface, QueryRunner } from "typeorm";

export class Createtableoffre1743600145650 implements MigrationInterface {
    name = 'Createtableoffre1743600145650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`offre\` (\`id\` int NOT NULL AUTO_INCREMENT, \`clientName\` varchar(255) NOT NULL, \`experience\` int NOT NULL, \`jobTitle\` varchar(255) NOT NULL, \`startDate\` date NOT NULL, \`endDate\` date NOT NULL, \`status\` enum ('en cours', 'terminé', 'annulé', 'en attente') NOT NULL DEFAULT 'en attente', \`requiredSpeciality\` enum ('Developer', 'DevOps', 'Cyber Security', 'Data') NOT NULL, \`requiredSkills\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`offre\``);
    }

}
