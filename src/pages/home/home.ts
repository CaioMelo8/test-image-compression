import { Component, ElementRef, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AlertController, IonicPage, NavController, NavParams } from "ionic-angular";
import { FileProvider } from "../../providers/file/file";
import { FileDocument } from "../../providers/file/file.model";
import { findUniqueFileName, isFileType } from "../../providers/file/file.utils";
import { ImageProvider } from "../../providers/image/image";
import { Image, ImageType } from "../../providers/image/image.model";
import { LoadingProvider } from "../../providers/loading/loading";
import { ZipProvider } from "../../providers/zip/zip";

@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage {
  protected files: FileDocument[] = [];
  protected zipFile: string;

  @ViewChild("inputFile", { read: ElementRef })
  private inputFileEl: ElementRef;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private domSanitizer: DomSanitizer,
    private fileProvider: FileProvider,
    private imageProvider: ImageProvider,
    private loadingProvider: LoadingProvider,
    private zipProvider: ZipProvider
  ) {}

  onImageAdd() {
    this.imageProvider
      .getImageFromGallery()
      .then((image: Image) => {
        const file: FileDocument = {
          name: image.name,
          data: `data:image/jpeg;base64,${image.data}`,
          size: image.data.length,
        };
        this.files.unshift(file);
        return file;
      })
      .then(file => this.fileProvider.readDataURLAsBlob(file.data));
  }

  onFileAdd() {
    const element = <HTMLInputElement>this.inputFileEl.nativeElement;
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  onFileDelete(index: number) {
    this.files.splice(index, 1);
  }

  onFileSelect(event: any) {
    const input = <HTMLInputElement>event.target;
    const file = input.files[0];
    input.value = "";

    this.loadingProvider.show("Carregando arquivo, por favor espere...");

    let promise: Promise<FileDocument>;

    if (isFileType({ name: file.name }, { extension: "heic" })) {
      promise = this.readHEICPictureFile(file);
    } else if (isFileType({ type: file.type }, { type: "image/" })) {
      promise = this.readPictureFile(file);
    } else {
      promise = this.readFile(file);
    }

    promise
      .then(file => {
        this.files.unshift(file);
        this.loadingProvider.dismiss();
      })
      .catch(() => {
        this.showFileError();
        this.loadingProvider.dismiss();
      });
  }

  onGenerateZip() {
    this.loadingProvider.show("Comprimindo arquivos, por favor espere...");

    this.zipProvider
      .zipFiles(this.files, { type: "base64", base64: true })
      .then((zipFile: string) => {
        this.zipFile = zipFile;
        this.loadingProvider.dismiss();
      });
  }

  isImage(file: FileDocument) {
    return isFileType({ data: file.data }, { type: "image/" });
  }

  sanitizeURL(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  private readFile(file: File): Promise<FileDocument> {
    return new Promise((resolve, reject) => {
      this.fileProvider
        .readFileAsDataURL(file)
        .then(dataURL => {
          const name = findUniqueFileName(this.files, file.name);
          resolve({ name: name, data: dataURL, type: file.type, size: file.size });
        })
        .catch(reject);
    });
  }

  private readPictureFile(file: File): Promise<FileDocument> {
    return new Promise((resolve, reject) => {
      this.imageProvider
        .compressImage(file)
        .then(compressedFile => this.readFile(compressedFile))
        .then(resolve)
        .catch(reject);
    });
  }

  private readHEICPictureFile(file: File): Promise<FileDocument> {
    return new Promise((resolve, reject) => {
      this.imageProvider
        .convertImage(file, ImageType.JPG)
        .then(convertedFile => this.readPictureFile(convertedFile))
        .then(resolve)
        .catch(reject);
    });
  }

  private showFileError() {
    const message = "Ocorreu um erro ao carregar o arquivo.";
    const buttons = [{ text: "OK" }];
    this.alertCtrl
      .create({ message: message, buttons: buttons, enableBackdropDismiss: false })
      .present();
  }
}
