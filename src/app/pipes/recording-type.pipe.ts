import { Pipe, PipeTransform } from '@angular/core';
import { KalturaRecordStatus } from "kaltura-ngx-client/api/types/KalturaRecordStatus";

@Pipe({
  name: 'recordingType'
})
export class RecordingTypePipe implements PipeTransform {

  transform(value: VidiunRecordStatus): string {
    switch (value) {
      case VidiunRecordStatus.disabled:
        return "";
      case VidiunRecordStatus.appended:
        return 'appendRecording';
      case VidiunRecordStatus.perSession:
        return 'newEntryPerSession';
    }
  }

}
