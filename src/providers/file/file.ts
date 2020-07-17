import { Injectable } from "@angular/core";
import Compressor from "compressorjs";

@Injectable()
export class FileProvider {
  constructor() {}

  public readFileAsDataURL(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        const base64 = fileReader.result;

        if (base64) {
          resolve(base64.toString());
        }
      };
      fileReader.onerror = error => reject(error);
      fileReader.readAsDataURL(file);
    });
  }

  public async readDataURLAsBlob(data: string) {
    const response = await fetch(data);
    return await response.blob();
  }

  public compressFile(file: File | Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.75,
        maxHeight: 1200,
        minHeight: 1200,
        success: (compressedFile: Blob) => resolve(compressedFile),
        error: error => reject(error),
      });
    });
  }
}
