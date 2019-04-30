import { Pipe, PipeTransform } from '@angular/core';
import { KalturaEntryModerationStatus } from "kaltura-ngx-client/api/types/KalturaEntryModerationStatus";

@Pipe({
  name: 'moderation'
})
export class ModerationPipe implements PipeTransform {

  transform(value: VidiunEntryModerationStatus): string {
    let moderationStatus: string = "";
    if (value) {
      switch (value) {
        case VidiunEntryModerationStatus.approved:
          moderationStatus = "Approved";
          break;
        case VidiunEntryModerationStatus.autoApproved:
          moderationStatus = "Auto Approved";
          break;
        case VidiunEntryModerationStatus.flaggedForReview:
          moderationStatus = "Flagged";
          break;
        case VidiunEntryModerationStatus.pendingModeration:
          moderationStatus = "Pending";
          break;
        case VidiunEntryModerationStatus.rejected:
          moderationStatus = "Rejected";
          break;
      }
      return moderationStatus;
    }
  }

}
