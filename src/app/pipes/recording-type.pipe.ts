import { Pipe, PipeTransform } from '@angular/core';
import { VidiunRecordStatus } from "vidiun-ngx-client/api/types/VidiunRecordStatus";

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
