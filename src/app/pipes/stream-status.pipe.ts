import { Pipe, PipeTransform } from '@angular/core';
import { VidiunEntryServerNodeStatus } from "vidiun-ngx-client/api/types/VidiunEntryServerNodeStatus";
import { VidiunViewMode } from "vidiun-ngx-client/api/types/VidiunViewMode";

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
