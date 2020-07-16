import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { HomePage } from "../pages/home/home";
import { HomePageModule } from "../pages/home/home.module";
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
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    LoadingProvider,
  ],
})
export class AppModule {}
