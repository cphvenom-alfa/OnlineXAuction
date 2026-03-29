import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/server/better-auth/config";
import { headers } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
  auctionImage: f({ image: { maxFileSize: "8MB", maxFileCount: 8 } })
    .middleware(async () => {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.url, name: file.name })),
  userAvatar: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

