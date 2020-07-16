import { Component, ViewChild, ElementRef } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import Compressor from "compressorjs";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { LoadingProvider } from "../../providers/loading/loading";

export interface FileDocument {
  name: string;
  data: string;
  size: number;
}

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
    private loadingProvider: LoadingProvider
  ) {}

  onFileAdd() {
    const element = <HTMLInputElement>this.inputFileEl.nativeElement;
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  onFileDelete(index: number) {
    this.files.splice(index);
  }

  onFileSelect(event: any) {
    const input = <HTMLInputElement>event.target;
    const file = input.files[0];
    input.value = "";

    this.loadingProvider.show("Carregando arquivo...");

    let compressedFile: Blob;

    this.compressFile(file)
      .then((file) => {
        compressedFile = file;
        return this.readFileAsDataURL(file);
      })
      .then((dataURL) => {
        this.files.unshift({
          name: file.name,
          data: dataURL,
          size: compressedFile.size,
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

  private compressFile(file: File | Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.75,
        maxHeight: 1200,
        minHeight: 1200,
        success: (compressedFile: Blob) => resolve(compressedFile),
        error: (error) => reject(error),
      });
    });
  }

  private readFileAsDataURL(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        const base64 = fileReader.result;

        if (base64) {
          resolve(base64.toString());
        }
      };
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsDataURL(file);
    });
  }
}
