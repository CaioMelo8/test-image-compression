import { NgModule } from '@angular/core';
import { FilesizePipe } from './filesize/filesize';
@NgModule({
	declarations: [FilesizePipe],
	imports: [],
	exports: [FilesizePipe]
})
export class PipesModule {}
