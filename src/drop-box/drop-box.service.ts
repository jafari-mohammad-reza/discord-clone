import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DROP_BOX_CONFIG } from './drop-box.module-defenition';
import { DropBoxConfig } from './drop-box.config';
import { Dropbox, DropboxResponse, Error, files } from 'dropbox';
import * as fs from 'fs';
import FileMetadata = files.FileMetadata;
import * as path from 'path';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class DropBoxService {
  private readonly dropBox: Dropbox;
  constructor(@Inject(DROP_BOX_CONFIG) private readonly config: DropBoxConfig) {
    this.dropBox = new Dropbox({ accessToken: config.access_token });
  }
  uploadImage(
    file: Express.Multer.File,
    filePath: string,
  ): Promise<DropboxResponse<FileMetadata>> {
    return this.dropBox
      .filesUpload({ path: filePath, contents: file.buffer })
      .catch((uploadErr: Error<files.UploadError>) => {
        throw new InternalServerErrorException(
          `Failed while uploading file ${uploadErr.error_summary}`,
        );
      });
  }

  deleteImage(fileRev: string, filePath: string) {
    this.dropBox
      .filesDeleteV2({
        path: filePath,
        parent_rev: fileRev,
      })
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }
}
