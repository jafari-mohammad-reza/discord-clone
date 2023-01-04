import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DROP_BOX_CONFIG } from './drop-box.module-defenition';
import { DropBoxConfig } from './drop-box.config';
import { Dropbox, DropboxResponse, Error, files } from 'dropbox';
import FileMetadata = files.FileMetadata;

@Injectable()
export class DropBoxService {
  private readonly dropBox: Dropbox;

  constructor(@Inject(DROP_BOX_CONFIG) private readonly config: DropBoxConfig) {
    try {
      this.dropBox = new Dropbox({ accessToken: config.access_token });
    } catch (err) {
      throw new HttpException('Dropbox service failed to maintain', 501);
    }
  }

  uploadImage(
    file: Express.Multer.File | Buffer,
    filePath: string,
  ): Promise<DropboxResponse<FileMetadata>> {
    return this.dropBox
      .filesUpload({ path: filePath, contents: file.buffer })
      .catch((uploadErr: Error<files.UploadError>) => {
        throw new InternalServerErrorException(
          `Failed while uploading file ${uploadErr}`,
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
        return err;
      });
  }
}
