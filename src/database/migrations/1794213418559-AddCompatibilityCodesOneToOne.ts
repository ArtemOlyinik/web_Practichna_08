import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompatibilityCodesOneToOne1794213418559 implements MigrationInterface {
    name = 'AddCompatibilityCodesOneToOne1794213418559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compatibility_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(60) NOT NULL, "manufacturer" character varying(100) NOT NULL, "is_interchangeable" boolean NOT NULL DEFAULT false, "notes" text, "auto_part_id" uuid NOT NULL, CONSTRAINT "UQ_11087e16f91fe20d16c6972b9ec" UNIQUE ("code"), CONSTRAINT "REL_92b208220822b8bcff1dd049af" UNIQUE ("auto_part_id"), CONSTRAINT "PK_cc40851d8f39ed6b98873baa803" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "compatibility_codes" ADD CONSTRAINT "FK_92b208220822b8bcff1dd049aff" FOREIGN KEY ("auto_part_id") REFERENCES "auto_parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compatibility_codes" DROP CONSTRAINT "FK_92b208220822b8bcff1dd049aff"`);
        await queryRunner.query(`DROP TABLE "compatibility_codes"`);
    }

}
