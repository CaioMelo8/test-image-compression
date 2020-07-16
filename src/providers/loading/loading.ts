import { Injectable } from "@angular/core";
import { Loading, LoadingController } from "ionic-angular";

@Injectable()
export class LoadingProvider {
  private readonly DEFAULT_MESSAGE = "Por favor, aguarde...";
  private loading: Loading;
  private loadingCount = 0;

  constructor(private loadingCtrl: LoadingController) {}

  public show(message?: string) {
    if (!message) {
      message = this.DEFAULT_MESSAGE;
    }

    if (this.loadingCount === 0) {
      this.loading = this.loadingCtrl.create({
        content: message,
        enableBackdropDismiss: false,
      });
      this.loading.present();
    }

    this.loadingCount++;
  }

  public dismiss() {
    this.loadingCount--;

    if (this.loadingCount === 0) {
      this.loading.dismiss();
      this.loading = null;
    }
  }
}
