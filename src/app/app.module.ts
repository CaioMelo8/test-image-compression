import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ImagePicker } from "@ionic-native/image-picker";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { HomePage } from "../pages/home/home";
import { HomePageModule } from "../pages/home/home.module";
import { FileProvider } from "../providers/file/file";
import { ImageProvider } from "../providers/image/image";
import { LoadingProvider } from "../providers/loading/loading";
import { MyApp } from "./app.component";

@NgModule({
  declarations: [MyApp],
  imports: [BrowserModule, IonicModule.forRoot(MyApp), HomePageModule],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage],
  providers: [
    StatusBar,
    SplashScreen,
    ImagePicker,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    FileProvider,
    ImageProvider,
    LoadingProvider,
  ],
})
export class AppModule {}
