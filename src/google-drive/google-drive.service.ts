import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Bucket, Storage } from "@google-cloud/storage";
import { Metadata } from "@google-cloud/storage/build/src/nodejs-common";
import { GoogleDriveConfig } from "../core/interfaces/google-drive.config";
import { GOOGLE_DRIVE_CONFIG } from "./google-drive.module-definition";
import * as fs from 'fs'
import * as path from "path";


@Injectable()
export class GoogleDriveService {
  private  storage: Storage;

  constructor(@Inject(GOOGLE_DRIVE_CONFIG) private readonly config: GoogleDriveConfig) {

    // this.storage = new Storage({
    //   projectId :config.project_id,
    //   credentials: {
    //     type :"service-account",
    //     private_key : config.private_key_id,
    //     client_email:config.client_email,
    //     client_id:config.client_id,
    //     client_secret:config.client_secret,
    //     token_url :config.token_url,
    //   }
    // })
    this.storage = new Storage({
      keyFilename : "google-drive-credentials.json"
    })
  }

  async upload(
    bucketName :string,
    file:Express.Multer.File,
    metadata?: Metadata
  ): Promise<string> {
    const bucket:Bucket = new Bucket(this.storage ,bucketName, {userProject:"Discord-Clone"})
    const bucketFile = bucket.file(file.originalname);
    const options = metadata ? { metadata } : undefined;
    await bucketFile.save(file.buffer, options);
    const uri = new URL(bucketFile.baseUrl);
    return uri.toString();
  }

}