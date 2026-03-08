import { AudioBookModelPromise } from "@/models/AudioBook";
import { AudioBookSchema } from "@/schemas/AudioBook";
import { tRPCRouter, tRPCProcedure } from "@/server/tRPC";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import z from "zod";

export const projectRouter = tRPCRouter({
    create: tRPCProcedure.input(AudioBookSchema).mutation(async ({ input }) => {
        const AudioBookModelResult = await AudioBookModelPromise;

        if (AudioBookModelResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                cause: AudioBookModelResult.error,
            });
        }

        const AudioBookModel = AudioBookModelResult.value;
        const insertOneResult = await AudioBookModel.insertOne({
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastAccessedAt: new Date(),
            status: "ACTIVE",
        });

        if (insertOneResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create 'audioBook'",
                cause: insertOneResult.error,
            });
        }

        return insertOneResult.value.insertedId.toString("hex");
    }),
    get: tRPCProcedure.input(z.hex().length(24)).query(async ({ input }) => {
        const AudioBookModelResult = await AudioBookModelPromise;

        if (AudioBookModelResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                cause: AudioBookModelResult.error,
            });
        }

        const AudioBookModel = AudioBookModelResult.value;
        const findOneResult = await AudioBookModel.findOneByID(ObjectId.createFromHexString(input));

        if (findOneResult.isErr()) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No 'active' project with ID: '${input}' found in database`,
                cause: findOneResult.error,
            });
        }

        return findOneResult.value;
    }),
    update: tRPCProcedure.input(AudioBookSchema.extend({ id: z.hex().length(24) })).mutation(async ({ input }) => {
        const AudioBookModelResult = await AudioBookModelPromise;

        if (AudioBookModelResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                cause: AudioBookModelResult,
            });
        }

        const AudioBookModel = AudioBookModelResult.value;
        const id = ObjectId.createFromHexString(input.id);
        const findOneResult = await AudioBookModel.findOneByID(id);

        if (findOneResult.isErr()) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No 'active' project with ID: ${input.id} found in database`,
                cause: findOneResult.error,
            });
        }

        const { id: _, ...inputWithoutID } = input;
        const updateOneResult = await AudioBookModel.replaceOneByID(id, {
            ...inputWithoutID,
            createdAt: findOneResult.value.createdAt,
            updatedAt: new Date(),
            lastAccessedAt: new Date(),
            status: "ACTIVE",
        });

        if (updateOneResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to update 'active' project with ID: ${input.id}`,
                cause: updateOneResult.error,
            });
        }

        if (updateOneResult.value.modifiedCount !== 1) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Failed to update 'active' project with ID: ${input.id}`,
            });
        }

        return;
    }),
    archive: tRPCProcedure.input(z.hex().length(24)).mutation(async ({ input }) => {
        const AudioBookModelResult = await AudioBookModelPromise;

        if (AudioBookModelResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                cause: AudioBookModelResult,
            });
        }

        const AudioBookModel = AudioBookModelResult.value;
        const id = ObjectId.createFromHexString(input);

        const updateOneResult = await AudioBookModel.updateOne(
            { _id: id, status: "ACTIVE" },
            { $set: { status: "ARCHIVED" } },
        );

        if (updateOneResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to update 'active' project with ID: ${input}`,
            });
        }

        if (updateOneResult.value.modifiedCount !== 1) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Failed to update 'active' project with ID: ${input}`,
            });
        }

        return;
    }),
    delete: tRPCProcedure.input(z.hex().length(24)).mutation(async ({ input }) => {
        const AudioBookModelResult = await AudioBookModelPromise;

        if (AudioBookModelResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                cause: AudioBookModelResult,
            });
        }

        const AudioBookModel = AudioBookModelResult.value;
        const id = ObjectId.createFromHexString(input);

        const updateOneResult = await AudioBookModel.updateOne(
            { _id: id, status: "ACTIVE" },
            { $set: { status: "DELETED" } },
        );

        if (updateOneResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to update 'active' project with ID: ${input}`,
            });
        }

        if (updateOneResult.value.modifiedCount !== 1) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Failed to update 'active' project with ID: ${input}`,
            });
        }

        return;
    }),
});
