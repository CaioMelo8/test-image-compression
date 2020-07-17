import { Component, ElementRef, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { FileProvider } from "../../providers/file/file";
import { FileDocument } from "../../providers/file/file.model";
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

    let fileSize: number;

    this.fileProvider
      .compressFile(file)
      .then(
        compressedFile => {
          fileSize = compressedFile.size;
          return this.fileProvider.readFileAsDataURL(compressedFile);
        },
        () => this.fileProvider.readFileAsDataURL(file)
      )
      .then(fileDataURL => {
        this.files.unshift({
          name: file.name,
          data: fileDataURL,
          size: fileSize,
        });
        this.loadingProvider.dismiss();
      })
      .catch(() => this.loadingProvider.dismiss());
  }

  isImage(file: FileDocument) {
    return file.data.indexOf("image/") !== -1;
  }

  sanitizeURL(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }
}
