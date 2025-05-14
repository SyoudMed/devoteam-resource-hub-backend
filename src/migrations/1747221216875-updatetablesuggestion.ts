import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatetablesuggestion1747221216875 implements MigrationInterface {
    name = 'Updatetablesuggestion1747221216875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`suggestion\` (\`id\` varchar(36) NOT NULL, \`content\` varchar(255) NOT NULL, \`date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`type\` enum ('training', 'skill', 'experience', 'general') NOT NULL DEFAULT 'general', \`authorId\` int NOT NULL, \`engineerId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`suggestion\` ADD CONSTRAINT \`FK_7db933be88fc07edc9759f09bc7\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`suggestion\` ADD CONSTRAINT \`FK_a0dea67f015d42a0e629530845e\` FOREIGN KEY (\`engineerId\`) REFERENCES \`engineer\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`suggestion\` DROP FOREIGN KEY \`FK_a0dea67f015d42a0e629530845e\``);
        await queryRunner.query(`ALTER TABLE \`suggestion\` DROP FOREIGN KEY \`FK_7db933be88fc07edc9759f09bc7\``);
        await queryRunner.query(`DROP TABLE \`suggestion\``);
    }

}
