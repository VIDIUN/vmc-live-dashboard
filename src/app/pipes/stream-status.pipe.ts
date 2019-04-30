import { Pipe, PipeTransform } from '@angular/core';
import { KalturaEntryServerNodeStatus } from "kaltura-ngx-client/api/types/KalturaEntryServerNodeStatus";
import { KalturaViewMode } from "kaltura-ngx-client/api/types/KalturaViewMode";

@Pipe({
  name: 'streamStatus'
})
export class StreamStatusPipe implements PipeTransform {

  transform(entryServerNodeStatus: VidiunEntryServerNodeStatus, viewMode = VidiunViewMode.allowAll): 'Live' | 'Initializing' | 'Offline' | 'Preview' {
    switch (entryServerNodeStatus) {
      case VidiunEntryServerNodeStatus.authenticated:
      case VidiunEntryServerNodeStatus.broadcasting:
        return 'Initializing';
      case VidiunEntryServerNodeStatus.playable:
        return (viewMode === VidiunViewMode.preview) ? 'Preview' : 'Live';
      case VidiunEntryServerNodeStatus.stopped:
      default:
        return 'Offline'
    }
  }

}
