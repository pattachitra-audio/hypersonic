import { AudioBookRepositoryResultAsync } from "@/repository/AudioBookRepository";
import { AudioBookSchema } from "@/schemas/AudioBook";
import { tRPCRouter, tRPCProcedure } from "@/server/tRPC";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import z from "zod";
import { omit } from "lodash";

export const projectRouter = tRPCRouter({
    create: tRPCProcedure.input(AudioBookSchema).mutation(async ({ input }) => {
        const AudioBookRepositoryResult = await AudioBookRepositoryResultAsync;

        if (AudioBookRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookRepository'",
                // cause: AudioBookRepositoryResult.error.cause,
            });
        }

        const AudioBookRepository = AudioBookRepositoryResult.value;
        const insertOneResult = await AudioBookRepository.insertOne({
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastAccessedAt: new Date(),
            status: "ACTIVE",
        });

        if (insertOneResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to insert 'audioBook'",
                cause: insertOneResult.error.cause,
            });
        }

        return insertOneResult.value.insertedId.toString("hex");
    }),
    get: tRPCProcedure.input(z.hex().length(24)).query(async ({ input }) => {
        const AudioBookRepositoryResult = await AudioBookRepositoryResultAsync;

        if (AudioBookRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookRepository'",
                // cause: AudioBookRepositoryResult.error.cause,
            });
        }

        const AudioBookRepository = AudioBookRepositoryResult.value;
        const findOneResult = await AudioBookRepository.findOneByID(ObjectId.createFromHexString(input));

        if (findOneResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error querying 'AudioBookRepository'`,
                cause: findOneResult.error,
            });
        }

        if (findOneResult.value === null) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No 'active' project with ID: '${input}' found in database`,
            });
        }

        return findOneResult.value;
    }),
    update: tRPCProcedure.input(AudioBookSchema.extend({ id: z.hex().length(24) })).mutation(async ({ input }) => {
        const AudioBookRepositoryResult = await AudioBookRepositoryResultAsync;

        if (AudioBookRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookRepository'",
                // cause: AudioBookRepositoryResult.error.cause,
            });
        }

        const AudioBookRepository = AudioBookRepositoryResult.value;
        const id = ObjectId.createFromHexString(input.id);
        const findOneResult = await AudioBookRepository.findOneByID(id);

        if (findOneResult.isErr() || findOneResult.value === null) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No 'active' project with ID: ${input.id} found in database`,
                // cause: findOneResult.error.cause,
            });
        }

        const updateOneResult = await AudioBookRepository.replaceOneByID(id, {
            ...omit(input, "id"),
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
        const AudioBookRepositoryResult = await AudioBookRepositoryResultAsync;

        if (AudioBookRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookRepository'",
                // cause: AudioBookRepositoryResult.error.cause,
            });
        }

        const AudioBookRepository = AudioBookRepositoryResult.value;
        const id = ObjectId.createFromHexString(input);

        const updateOneResult = await AudioBookRepository.updateOne(
            { _id: id, status: "ACTIVE" },
            { $set: { status: "ARCHIVED" } },
        );

        if (updateOneResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to update 'active' project with ID: ${input}`,
                cause: updateOneResult.error.cause,
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
        const AudioBookRepositoryResult = await AudioBookRepositoryResultAsync;

        if (AudioBookRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookRepository'",
                // cause: AudioBookRepositoryResult.error.cause,
            });
        }

        const AudioBookRepository = AudioBookRepositoryResult.value;
        const id = ObjectId.createFromHexString(input);

        const updateOneResult = await AudioBookRepository.updateOne(
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
