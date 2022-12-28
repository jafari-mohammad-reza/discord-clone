import * as path from 'path';

export default function ReturnUploadPath(
  mainPath: string,
  identifier: string,
  file: Express.Multer.File,
) {
  return `/${mainPath}/${identifier.replace(' ', '-')}${Date.now()}
${path.extname(file.originalname)}`.trim();
}
