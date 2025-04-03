import { MigrationInterface, QueryRunner } from "typeorm";

export class AddcolumntoReservationTable1743372302115 implements MigrationInterface {
    name = 'AddcolumntoReservationTable1743372302115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_674c102955d5c370b71d8a37bfe\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_9656a770da5fcc7036c0a3aca4d\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`engineerId\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`commercialId\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`engineer_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`commercial_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_85a7348ec693cdebefbc90575c6\` FOREIGN KEY (\`engineer_id\`) REFERENCES \`engineer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_34f6e235c56167f77187c8b7d73\` FOREIGN KEY (\`commercial_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_34f6e235c56167f77187c8b7d73\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_85a7348ec693cdebefbc90575c6\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`commercial_id\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`engineer_id\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`commercialId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`engineerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_9656a770da5fcc7036c0a3aca4d\` FOREIGN KEY (\`commercialId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_674c102955d5c370b71d8a37bfe\` FOREIGN KEY (\`engineerId\`) REFERENCES \`engineer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
