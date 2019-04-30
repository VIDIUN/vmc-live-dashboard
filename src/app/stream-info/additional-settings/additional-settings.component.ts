import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import { LiveEntryService } from "../../services/live-entry.service";
import { PartnerInformationService } from "../../services/partner-information.service";
//types
import { KalturaDVRStatus } from "kaltura-ngx-client/api/types/KalturaDVRStatus";
import { KalturaRecordStatus } from "kaltura-ngx-client/api/types/KalturaRecordStatus";
import { KalturaLiveStreamEntry } from "kaltura-ngx-client/api/types/KalturaLiveStreamEntry";

@Component({
  selector: 'additional-settings',
  templateUrl: './additional-settings.component.html',
  styleUrls: ['./additional-settings.component.scss']
})
export class AdditionalSettingsComponent implements OnInit {
  public _conversionProfilesList: SelectItem[];
  public _currentEntry: VidiunLiveStreamEntry;
  // TODO: Find a better solution to not use the boolean!
  public _recording: boolean;
  public _previewMode: boolean;

  constructor(private _liveEntryService: LiveEntryService, private _partnerInformationService: PartnerInformationService) { }

  ngOnInit() {
    this._conversionProfilesList = [];
    this._getConversionProfilesList();
    this._liveEntryService.liveStream$.subscribe(response => {
      if (response) {
        this._currentEntry = response;
        this._recording = (response.recordStatus !== VidiunRecordStatus.disabled);
        // TODO: Add support for Preview-Mode in backend API calls
      }
    });
  }

  private _getConversionProfilesList(): void {
    this._partnerInformationService.getConversionProfiles()
      .subscribe(result => {
        this._conversionProfilesList = result.objects.map(cp=> {
          return { label: cp.name, value: cp.id };
        });
      })
  }

  public _onDvrCheckChange(event: any): void {
    this._currentEntry.dvrStatus = (event) ? VidiunDVRStatus.enabled : VidiunDVRStatus.disabled;
  }

  public _onRecordingCheckChange(event: any): void {
    if (!event) {
      this._currentEntry.recordStatus = VidiunRecordStatus.disabled;
    }
  }

  public _onClickRecordingRadio(event: any): void {
    if (event === 'appendRecording') {
      this._currentEntry.recordStatus = VidiunRecordStatus.appended;
    }
    else if (event === 'newEntryPerSession') {
      this._currentEntry.recordStatus = VidiunRecordStatus.perSession;
    }
  }
}
