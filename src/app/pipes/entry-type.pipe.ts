import { Pipe, PipeTransform } from '@angular/core';
import { VidiunMediaType } from "vidiun-ngx-client/api/types/VidiunMediaType";

@Pipe({
  name: 'entryType'
})
export class EntryTypePipe implements PipeTransform {

  transform(value: VidiunMediaType): string {
    let entryType: string = "";
    switch (value) {
      case VidiunMediaType.audio:
        entryType = "Audio";
        break;
      case VidiunMediaType.video:
        entryType = "Video";
        break;
      case VidiunMediaType.image:
        entryType = "Image";
        break;
      case VidiunMediaType.liveStreamFlash:
      case VidiunMediaType.liveStreamQuicktime:
      case VidiunMediaType.liveStreamRealMedia:
      case VidiunMediaType.liveStreamWindowsMedia:
        entryType = "Live";
        break;
      default:
        entryType = "Unknown";
        break;
    }

    return entryType;
  }

}
