import { Injectable } from "@angular/core";
import JSZip from "jszip";
import { FileDocument } from "../file/file.model";
import { removeDataURLMetadata } from "../file/file.utils";

export interface ZipOptions {
  type:
    | "base64"
    | "text"
    | "binarystring"
    | "array"
    | "uint8array"
    | "arraybuffer"
    | "blob"
    | "nodebuffer";
  base64?: boolean;
  binary?: boolean;
}

@Injectable()
export class ZipProvider {
  private defaultZipOptions: ZipOptions = { type: "base64" };

  constructor() {}

  public zipFiles(files: FileDocument[], options: ZipOptions): Promise<any> {
    if (!options) options = this.defaultZipOptions;

    const zip = new JSZip();

    files.forEach(file => {
      zip.file(file.name, removeDataURLMetadata(file.data), {
        base64: options.base64,
        binary: options.binary,
      });
    });

    return zip.generateAsync({
      type: options.type,
      compression: "DEFLATE",
      compressionOptions: { level: 5 },
    });
  }
}
