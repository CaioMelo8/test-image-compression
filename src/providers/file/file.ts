import { Injectable } from "@angular/core";

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

  public readFileAsArrayBuffer(file: File | Blob): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        const arrayBuffer = fileReader.result;

        if (arrayBuffer) {
          resolve(arrayBuffer);
        }
      };
      fileReader.onerror = error => reject(error);
      fileReader.readAsArrayBuffer(file);
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
}
