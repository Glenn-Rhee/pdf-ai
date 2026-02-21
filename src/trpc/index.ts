import { router } from "./trpc";
import TrpcService from "../service/Trpc-Service";

export const appRouter = router({
  authCallback: await TrpcService.authCallback(),
  getUserFiles: await TrpcService.getUserFiles(),
  getFile: await TrpcService.getFile(),
  deleteFile: await TrpcService.deleteFile(),
  getFileUploadStatus: await TrpcService.getFileUploadStatus(),
  getFileMessages: await TrpcService.getFileMessages() 
});

export type AppRouter = typeof appRouter;
