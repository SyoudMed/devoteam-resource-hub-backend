import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReservationTable1743335774265 implements MigrationInterface {
    name = 'CreateReservationTable1743335774265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`reservation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`startTime\` datetime NOT NULL, \`endTime\` datetime NOT NULL, \`clientName\` varchar(255) NOT NULL, \`meetingPurpose\` varchar(255) NULL, \`status\` enum ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`engineerId\` int NULL, \`commercialId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_674c102955d5c370b71d8a37bfe\` FOREIGN KEY (\`engineerId\`) REFERENCES \`engineer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_9656a770da5fcc7036c0a3aca4d\` FOREIGN KEY (\`commercialId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_9656a770da5fcc7036c0a3aca4d\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_674c102955d5c370b71d8a37bfe\``);
        await queryRunner.query(`DROP TABLE \`reservation\``);
    }

}
