import { Component, ElementRef, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AlertController, IonicPage, NavController, NavParams } from "ionic-angular";
import { FileProvider } from "../../providers/file/file";
import { FileDocument } from "../../providers/file/file.model";
import { findUniqueFileName, isImageFile } from "../../providers/file/file.utils";
import { ImageProvider } from "../../providers/image/image";
import { Image } from "../../providers/image/image.model";
import { LoadingProvider } from "../../providers/loading/loading";

@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage {
  protected files: { name: string; data: string; size: number }[] = [];

  @ViewChild("inputFile", { read: ElementRef })
  private inputFileEl: ElementRef;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private domSanitizer: DomSanitizer,
    private fileProvider: FileProvider,
    private imageProvider: ImageProvider,
    private loadingProvider: LoadingProvider
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
      .then(file => this.fileProvider.readDataURLAsBlob(file.data))
      .then(fileBlob => console.log("fileBlob", fileBlob));
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

    this.loadingProvider.show("Carregando arquivo...");

    if (file.type.startsWith("image/")) {
      this.fileProvider
        .compressImage(file)
        .then(compressedFile => this.readFile(compressedFile))
        .then(fileDocument => {
          this.files.unshift(fileDocument);
          this.loadingProvider.dismiss();
        })
        .catch(() => {
          this.showFileError();
          this.loadingProvider.dismiss();
        });
    } else {
      this.readFile(file)
        .then(fileDocument => {
          this.files.unshift(fileDocument);
          this.loadingProvider.dismiss();
        })
        .catch(() => {
          this.showFileError();
          this.loadingProvider.dismiss();
        });
    }
  }

  isImage(file: FileDocument) {
    return isImageFile({ dataURL: file.data });
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
          resolve({ name: name, data: dataURL, size: file.size });
        })
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
