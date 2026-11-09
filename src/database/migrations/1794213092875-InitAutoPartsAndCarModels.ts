import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAutoPartsAndCarModels1794213092875 implements MigrationInterface {
    name = 'InitAutoPartsAndCarModels1794213092875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "car_models" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "brand" character varying(80) NOT NULL, "year_from" smallint NOT NULL, "year_to" smallint, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ee4355345e0e1c18cb6efa2bd5c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_car_models_brand_name_year" ON "car_models"  ("brand", "name", "year_from") `);
        await queryRunner.query(`CREATE TYPE "public"."auto_parts_condition_enum" AS ENUM('NEW', 'REFURBISHED')`);
        await queryRunner.query(`CREATE TABLE "auto_parts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(150) NOT NULL, "price" numeric(10,2) NOT NULL, "oemCode" character varying(50) NOT NULL, "condition" "public"."auto_parts_condition_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "car_model_id" uuid NOT NULL, CONSTRAINT "UQ_e72967390e2588764aa2f69a313" UNIQUE ("oemCode"), CONSTRAINT "PK_7edd64aafe1ae71a075edd47718" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "auto_parts" ADD CONSTRAINT "FK_7f333c1fea8e5ca17703e83473a" FOREIGN KEY ("car_model_id") REFERENCES "car_models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auto_parts" DROP CONSTRAINT "FK_7f333c1fea8e5ca17703e83473a"`);
        await queryRunner.query(`DROP TABLE "auto_parts"`);
        await queryRunner.query(`DROP TYPE "public"."auto_parts_condition_enum"`);
        await queryRunner.query(`DROP INDEX "public"."uq_car_models_brand_name_year"`);
        await queryRunner.query(`DROP TABLE "car_models"`);
    }

}
