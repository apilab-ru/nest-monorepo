import { Injectable } from "@nestjs/common";
import fs = require('fs');
import { environment } from "../../../environments/environment";
const path = require('path');

@Injectable()
export class ProxyService {
   private fileDir = environment.fileDir;

   proxyFile(file: string): Promise<Buffer> {
      const fileName = path.format({
         dir: this.fileDir,
         base: file,
      });

      return fs.promises.readFile(fileName)
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
