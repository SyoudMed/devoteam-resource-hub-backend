import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1743287428275 implements MigrationInterface {
    name = 'InitialSchema1743287428275'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`telephone\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('MANAGER', 'INGENIEUR', 'COMMERCIAL') NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`resetCode\` varchar(255) NULL, \`resetCodeExpiration\` bigint NULL, \`verificationCode\` varchar(6) NULL, \`verificationCodeExpiration\` bigint NULL, \`isVerified\` tinyint NOT NULL DEFAULT 0, \`isFirstLogin\` tinyint NOT NULL DEFAULT 1, \`profilePhotoUrl\` varchar(255) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`engineer\` (\`id\` int NOT NULL AUTO_INCREMENT, \`disponibiliteStatus\` enum ('available', 'unavailable') NOT NULL DEFAULT 'available', \`speciality\` varchar(255) NOT NULL, \`userId\` int NULL, UNIQUE INDEX \`REL_8d9c64597951e26c9632bf8c7a\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comment\` (\`id\` varchar(36) NOT NULL, \`content\` varchar(255) NOT NULL, \`rating\` int NOT NULL, \`date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`authorId\` int NOT NULL, \`engineerId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`engineer\` ADD CONSTRAINT \`FK_8d9c64597951e26c9632bf8c7ad\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_276779da446413a0d79598d4fbd\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_b8ad337f387c0843ce11985950f\` FOREIGN KEY (\`engineerId\`) REFERENCES \`engineer\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_b8ad337f387c0843ce11985950f\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_276779da446413a0d79598d4fbd\``);
        await queryRunner.query(`ALTER TABLE \`engineer\` DROP FOREIGN KEY \`FK_8d9c64597951e26c9632bf8c7ad\``);
        await queryRunner.query(`DROP TABLE \`comment\``);
        await queryRunner.query(`DROP INDEX \`REL_8d9c64597951e26c9632bf8c7a\` ON \`engineer\``);
        await queryRunner.query(`DROP TABLE \`engineer\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
