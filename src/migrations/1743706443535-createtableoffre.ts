import { MigrationInterface, QueryRunner } from "typeorm";

export class Createtableoffre1743706443535 implements MigrationInterface {
    name = 'Createtableoffre1743706443535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`offre\` (\`id\` int NOT NULL AUTO_INCREMENT, \`clientName\` varchar(255) NOT NULL, \`experience\` int NOT NULL, \`jobTitle\` varchar(255) NOT NULL, \`startDate\` date NOT NULL, \`endDate\` date NOT NULL, \`status\` enum ('en cours', 'terminé', 'annulé', 'en attente') NOT NULL DEFAULT 'en attente', \`requiredSpeciality\` enum ('Developer', 'DevOps', 'Cyber Security', 'Data') NOT NULL, \`requiredSkills\` json NOT NULL, \`createdById\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`offre\` ADD CONSTRAINT \`FK_3244f4af8f16361c2ee88b871e4\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offre\` DROP FOREIGN KEY \`FK_3244f4af8f16361c2ee88b871e4\``);
        await queryRunner.query(`DROP TABLE \`offre\``);
    }

}
