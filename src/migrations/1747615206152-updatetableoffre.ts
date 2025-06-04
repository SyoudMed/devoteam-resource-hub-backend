import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatetableoffre1747615206152 implements MigrationInterface {
    name = 'Updatetableoffre1747615206152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offre\` ADD \`assignedEngineerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`offre\` ADD CONSTRAINT \`FK_604f4a3c4d5f92d3c7acfd74696\` FOREIGN KEY (\`assignedEngineerId\`) REFERENCES \`engineer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offre\` DROP FOREIGN KEY \`FK_604f4a3c4d5f92d3c7acfd74696\``);
        await queryRunner.query(`ALTER TABLE \`offre\` DROP COLUMN \`assignedEngineerId\``);
    }

}
