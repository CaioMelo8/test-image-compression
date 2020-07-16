import { Component } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import Compressor from "compressorjs";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { LoadingProvider } from "../../providers/loading/loading";

@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage {
  protected files: { name: string; data: string }[] = [];

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    private domSanitizer: DomSanitizer,
    private loadingProvider: LoadingProvider
  ) {}

  onFileDelete(index: number) {
    this.files.splice(index);
  }

  onFileSelect(event: any) {
    const input = <HTMLInputElement>event.target;
    const file = input.files[0];
    input.value = "";

    this.loadingProvider.show("Carregando arquivo...");

    this.compressFile(file)
      .then((compressedFile) => this.readFileAsDataURL(compressedFile))
      .then((dataURL) => {
        console.log({ dataURL });
        this.files.unshift({ name: file.name, data: dataURL });
        this.loadingProvider.dismiss();
      })
      .catch(() => this.loadingProvider.dismiss());
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
