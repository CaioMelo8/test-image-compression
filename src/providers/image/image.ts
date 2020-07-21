import { Injectable } from "@angular/core";
import { ImagePicker, ImagePickerOptions } from "@ionic-native/image-picker";
import Compressor from "compressorjs";
import convert from "heic-convert";
import heic2any from "heic2any";
import { FileProvider } from "../file/file";
import { addFileNameExtension } from "../file/file.utils";
import { Image, ImageType } from "./image.model";

enum OutputType {
  FILE_URI = 0,
  DATA_URI = 1,
}

@Injectable()
export class ImageProvider {
  private readonly imagePickerOptions: ImagePickerOptions = {
    height: 1200,
    width: 1200,
    quality: 0.6,
    maximumImagesCount: 1,
    outputType: OutputType.DATA_URI,
  };
  private readonly compressionOpions: Compressor.Options = {
    strict: true,
    quality: 0.7,
    maxHeight: 1800,
    maxWidth: 1800,
    mimeType: "image/jpeg",
  };

  constructor(private imagePicker: ImagePicker, private fileProvider: FileProvider) {}

  public getImageFromGallery(): Promise<Image> {
    return new Promise((resolve, reject) => {
      this.handleReadPermission()
        .then(() => {
          this.imagePicker.getPictures(this.imagePickerOptions).then((images: string[]) => {
            if (images && images.length > 0) {
              const image: Image = {
                name: `image-${new Date().getTime()}`,
                data: images[0],
              };
              resolve(image);
            } else {
              resolve();
            }
          });
        })
        .catch(error => reject(error));
    });
  }

  private handleReadPermission() {
    return new Promise((resolve, reject) => {
      this.imagePicker
        .hasReadPermission()
        .then(hasPermission => {
          if (hasPermission) {
            resolve(true);
          } else {
            this.imagePicker
              .requestReadPermission()
              .then(() => this.imagePicker.hasReadPermission())
              .then(hasPermission => {
                if (hasPermission) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              });
          }
        })
        .catch(error => reject(error));
    });
  }

  public compressImage(image: File): Promise<File> {
    return new Promise(resolve => {
      const compressionOptions: Compressor.Options = {
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

  public convertHEICImage(image: File, toType: ImageType): Promise<File> {
    return new Promise(resolve => {
      heic2any({ blob: image, toType: toType }).then(
        response => {
          let imageBlob: Blob;

          if (response instanceof Array && response.length > 0) {
            imageBlob = response[0];
          } else if (response instanceof Blob) {
            imageBlob = response;
          }

          const imageProperties = { type: toType, lastModified: new Date().getTime() };
          const convertedImage = new File([imageBlob], image.name, imageProperties);

          resolve(convertedImage);
        },
        () => resolve(image)
      );
    });
  }

  public convertHEICImage2(image: File, toType: ImageType.JPG | ImageType.PNG): Promise<File> {
    return new Promise(resolve => {
      this.fileProvider.readFileAsArrayBuffer(image).then((arrayBuffer: ArrayBuffer) => {
        let format: string;

        if (toType === ImageType.JPG) {
          format = "JPEG";
        } else if (toType === ImageType.PNG) {
          format = "PNG";
        }

        convert({ buffer: new Uint8Array(arrayBuffer), format }).then(
          (response: Uint8Array) => {
            const imageProperties = { type: toType, lastModified: new Date().getTime() };
            const convertedImage = new File([response], image.name, imageProperties);

            resolve(convertedImage);
          },
          () => resolve(image)
        );
      });
    });
  }
}
