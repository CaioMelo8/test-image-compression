import { Injectable } from "@angular/core";
import { ImagePicker } from "@ionic-native/image-picker";
import { Image } from "./image.model";

enum OutputType {
  FILE_URI = 0,
  DATA_URI = 1,
}

@Injectable()
export class ImageProvider {
  private readonly imagePickerOptions = {
    height: 1200,
    width: 1200,
    quality: 0.6,
    maximumImagesCount: 1,
    outputType: OutputType.DATA_URI,
  };

  constructor(private imagePicker: ImagePicker) {}

  public getImageFromGallery(): Promise<Image> {
    return new Promise((resolve, reject) => {
      this.handleReadPermission()
        .then(() => {
          this.imagePicker
            .getPictures(this.imagePickerOptions)
            .then((images: string[]) => {
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
        .catch((error) => reject(error));
    });
  }

  private handleReadPermission() {
    return new Promise((resolve, reject) => {
      this.imagePicker
        .hasReadPermission()
        .then((hasPermission) => {
          if (hasPermission) {
            resolve(true);
          } else {
            this.imagePicker
              .requestReadPermission()
              .then(() => this.imagePicker.hasReadPermission())
              .then((hasPermission) => {
                if (hasPermission) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              });
          }
        })
        .catch((error) => reject(error));
    });
  }
}
