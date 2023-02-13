import { Injectable } from "@nestjs/common";
import fs = require('fs');

@Injectable()
export class ProxyService {
    proxyFile(file: string): Promise<Buffer> {
        return new Promise(resolve => {
            fs.readFile(file, (err, content) => {
                resolve(content);
            });
        });
    }

    getFileType(file: string): string {
        const [ext] = file.split('.').reverse();

        switch (ext) {
            case 'zip':
                return 'application/zip';

            case 'jpg':
                return 'image/jpg';

            default:
                console.error('Not found type', ext, file);
                return '';
        }
    }
}
