import {createReadStream} from 'fs';
import * as streamBuffers from 'stream-buffers';
import * as path from 'path';

const fileToBuffer = (filename) => {
    const readStream = createReadStream(filename);
    const chunks = [];
    return new Promise((resolve, reject) => {
        // Handle any errors while reading
        readStream.on('error', (err) => {
            // handle error

            // File could not be read
            reject(err);
        });

        // Listen for data
        readStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        // File is done being read
        readStream.on('close', () => {
            // Create a buffer of the image from the stream
            resolve(Buffer.concat(chunks));
        });
    });
};

export async function fileMock() {
    const imageBuffer = (await fileToBuffer(
        path.join(__dirname, '..', '..', '..', 'public', 'app-logo.jpg'),
    )) as Buffer;

    const myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
        frequency: 10, // in milliseconds.
        chunkSize: 2048, // in bytes.
    });
    myReadableStreamBuffer.put(imageBuffer as Buffer);
    return {
        buffer: imageBuffer,
        fieldname: 'fieldname-defined-in-@UseInterceptors-decorator',
        originalname: 'original-filename',
        encoding: '7bit',
        mimetype: 'file-mimetyp',
        destination: 'destination-path',
        filename: 'file-name',
        path: 'file-path',
        size: 955578,
        stream: myReadableStreamBuffer,
    };
}
