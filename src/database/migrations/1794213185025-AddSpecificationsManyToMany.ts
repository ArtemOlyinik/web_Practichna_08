import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSpecificationsManyToMany1794213185025 implements MigrationInterface {
    name = 'AddSpecificationsManyToMany1794213185025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "specifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "UQ_44e3bc32836e8579978ecc6c6cf" UNIQUE ("name"), CONSTRAINT "PK_621aabf71e640ab86f0e8b62a37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auto_part_specifications" ("auto_part_id" uuid NOT NULL, "specification_id" uuid NOT NULL, CONSTRAINT "PK_df8e322112ee2b18b9e0fd35f7c" PRIMARY KEY ("auto_part_id", "specification_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7499227900b409f2904f2cb0dd" ON "auto_part_specifications"  ("auto_part_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4aec4fc6a83db0075ca5f5fbdb" ON "auto_part_specifications"  ("specification_id") `);
        await queryRunner.query(`ALTER TABLE "auto_part_specifications" ADD CONSTRAINT "FK_7499227900b409f2904f2cb0dd1" FOREIGN KEY ("auto_part_id") REFERENCES "auto_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "auto_part_specifications" ADD CONSTRAINT "FK_4aec4fc6a83db0075ca5f5fbdb9" FOREIGN KEY ("specification_id") REFERENCES "specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auto_part_specifications" DROP CONSTRAINT "FK_4aec4fc6a83db0075ca5f5fbdb9"`);
        await queryRunner.query(`ALTER TABLE "auto_part_specifications" DROP CONSTRAINT "FK_7499227900b409f2904f2cb0dd1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4aec4fc6a83db0075ca5f5fbdb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7499227900b409f2904f2cb0dd"`);
        await queryRunner.query(`DROP TABLE "auto_part_specifications"`);
        await queryRunner.query(`DROP TABLE "specifications"`);
    }

}
