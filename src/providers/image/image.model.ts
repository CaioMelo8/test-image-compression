export interface Image {
  data: string;
  name: string;
}

export enum ImageType {
  JPG = "image/jpg",
  PNG = "image/png",
  BMP = "image/bmp",
  GIF = "image/gif",
  HEIC = "image/heic",
}
