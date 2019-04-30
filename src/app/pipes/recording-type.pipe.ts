import { Pipe, PipeTransform } from '@angular/core';
import { VidiunRecordStatus } from "vidiun-typescript-client/types/VidiunRecordStatus";

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
