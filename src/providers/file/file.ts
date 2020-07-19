import { Injectable } from "@angular/core";
import Compressor from "compressorjs";
import { addFileNameExtension } from "./file.utils";

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

  public readDataURLAsBlob(dataURL: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      fetch(dataURL)
        .then(response => response.blob())
        .then(resolve)
        .catch(error => reject(error));
    });
  }

  public compressImage(image: File): Promise<File> {
    return new Promise(resolve => {
      const compressionOptions: Compressor.Options = {
        strict: true,
        quality: 0.7,
        maxHeight: 1800,
        maxWidth: 1800,
        mimeType: "image/jpeg",
        success: (imageBlob: Blob) => {
          const imageName = addFileNameExtension(image.name, "jpeg");
          const imageProperties: FilePropertyBag = {
            type: imageBlob.type,
            lastModified: new Date().getTime(),
          };
          resolve(new File([imageBlob], imageName, imageProperties));
        },
        error: () => resolve(image),
      };
      new Compressor(image, compressionOptions);
    });
  }
}
