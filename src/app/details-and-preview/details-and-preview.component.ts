import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { LiveEntryService } from "../services/live-entry.service";
import { LiveDashboardConfiguration } from "../services/live-dashboard-configuration.service";
import { LiveEntryDynamicStreamInfo, LoadingStatus, PlayerConfig } from "../types/live-dashboard.types";
import { ISubscription } from "rxjs/Subscription";
import { VidiunViewMode } from "vidiun-ngx-client/api/types/VidiunViewMode";
import { VidiunLiveStreamEntry } from "vidiun-ngx-client/api/types/VidiunLiveStreamEntry";
import { VidiunRecordingStatus } from "vidiun-ngx-client/api/types/VidiunRecordingStatus";
import { ConfirmationService } from "primeng/primeng";
import { AppLocalization } from "@vidiun-ng/vidiun-common";
import { VidiunNullableBoolean } from "vidiun-ngx-client/api/types/VidiunNullableBoolean";

interface ExplicitLiveObject {
  enabled?: boolean,
  previewMode?: boolean
}

@Component({
  selector: 'details-and-preview',
  templateUrl: './details-and-preview.component.html',
  styleUrls: ['./details-and-preview.component.scss']
})
export class DetailAndPreviewComponent implements OnInit, OnDestroy {
  public  _applicationLoaded: boolean;
  private _applicationStatusSubscription: ISubscription;
  private _liveStreamSubscription: ISubscription;
  private _dynamicInformationSubscription: ISubscription;
  private _explicitLiveWaitFlagSubscription: ISubscription;

  public  _dynamicInfo: LiveEntryDynamicStreamInfo = {
    redundancy: false,
    streamStatus: { state: 'Offline' }
  };
  private _tempExplicitLiveInformation: ExplicitLiveObject = {};
  public  _explicitLiveInformation: ExplicitLiveObject;
  public  _liveEntry: VidiunLiveStreamEntry;
  public  _explicitLiveWaitFlag = false;
  public  _player: { configuration: PlayerConfig, visible: boolean };
  public  _inFullScreen = false;
  private _vdp: any;

  @Input() compactMode = false;

  @Input() colorsReverted = false;

  @Input() electronMode = false;

  constructor(private _liveEntryService : LiveEntryService,
              private _liveDashboardConfiguration: LiveDashboardConfiguration,
              private _confirmationService: ConfirmationService,
              private _appLocalization: AppLocalization) {
    if (window.addEventListener) {
      window.addEventListener('message', this._receivePostMessage.bind(this), false);
    }
  }

  ngOnInit() {
    this._player = { configuration: {}, visible: !this.electronMode };
    this._subscribeToApplicationStatus();
    this._subscribeToExplicitLiveWaitFlag();
    this._subscribeToLiveStream();
    this._subscribeToDynamicInformation();
  }

  ngOnDestroy() {
    this._applicationStatusSubscription.unsubscribe();
    this._liveStreamSubscription.unsubscribe();
    this._explicitLiveWaitFlagSubscription.unsubscribe();
    this._dynamicInformationSubscription.unsubscribe();
    this._vdp.vUnbind('.liveDashboard');
  }

  private _subscribeToApplicationStatus(): void {
    this._applicationStatusSubscription = this._liveEntryService.applicationStatus$
      .subscribe(response => {
        if (response) {
          this._applicationLoaded = (response.liveEntry === LoadingStatus.succeeded) &&
                                    (response.streamStatus === LoadingStatus.succeeded)
        }
      });
  }

  private _subscribeToLiveStream(): void {
    this._liveStreamSubscription = this._liveEntryService.liveStream$.subscribe(response => {
      if (response) {
        this._liveEntry = response;

        this._player.configuration.partnerId = response.partnerId;
        this._player.configuration.entryId = response.id;
        this._player.configuration.vs = this._liveDashboardConfiguration.vs;
        this._player.configuration.uiConfId = this._liveDashboardConfiguration.player.uiConfId;
        this._player.configuration.serviceUrl = this._liveDashboardConfiguration.service_url;
        this._player.configuration.flashVars = {
          autoPlay: this._player.visible,
          SkipVSOnIsLiveRequest: false,
          vs: this._player.configuration.vs
        };

        if (typeof response.explicitLive === 'boolean') {
          this._tempExplicitLiveInformation.enabled = <boolean>response.explicitLive;
        }
        else {
          this._tempExplicitLiveInformation.enabled = response.explicitLive === VidiunNullableBoolean.trueValue;
        }
        this._tempExplicitLiveInformation.previewMode = response.viewMode === VidiunViewMode.preview;
        if (!this._explicitLiveInformation) {
          this._initializeExplicitLive();
        }
      }
    });
  }

  private _initializeExplicitLive(): void {
    this._explicitLiveInformation = {};
    this._explicitLiveInformation.enabled = this._tempExplicitLiveInformation.enabled;
    this._explicitLiveInformation.previewMode = this._tempExplicitLiveInformation.previewMode;
  }

  private _subscribeToExplicitLiveWaitFlag(): void {
    this._explicitLiveWaitFlagSubscription = this._liveEntryService.explicitLiveWait$.subscribe(response => {
      this._explicitLiveWaitFlag = response;
      if (this._explicitLiveInformation && !this._explicitLiveWaitFlag) {
        this._explicitLiveInformation.enabled = this._tempExplicitLiveInformation.enabled;
        this._explicitLiveInformation.previewMode = this._tempExplicitLiveInformation.previewMode;
      }
    });
  }

  private _subscribeToDynamicInformation(): void {
    this._dynamicInformationSubscription = this._liveEntryService.entryDynamicInformation$.subscribe(response => {
      if (response) {
        this._dynamicInfo = response;
      }
    });
  }

  public _onClickGoLive() {
    this._liveEntry.viewMode = VidiunViewMode.allowAll;
    this._liveEntry.recordingStatus = VidiunRecordingStatus.active;

    this._liveEntryService.updateLiveStreamEntryByApi(['viewMode', 'recordingStatus']);
  }

  public _onClickEndLive() {
    this._confirmationService.confirm({
      message: this._appLocalization.get('DETAILS_AND_PREVIEW.explicit_live.end_live_alert.message'),
      header: this._appLocalization.get('DETAILS_AND_PREVIEW.explicit_live.end_live_alert.header'),
      accept: () => {
        this._liveEntry.viewMode = VidiunViewMode.preview;
        this._liveEntry.recordingStatus = VidiunRecordingStatus.stopped;

        this._liveEntryService.updateLiveStreamEntryByApi(['viewMode', 'recordingStatus']);
      },
    });
  }

  public _onPlayerReady(vdp: any) {
    this._vdp = vdp;
    vdp.vBind( "openFullScreen.liveDashboard", () => {
      this._inFullScreen = true;
    });
    vdp.vBind( "closeFullScreen.liveDashboard", () => {
      this._inFullScreen = false;
    });
  }

  private _receivePostMessage(message: any): void {
    if (message.data.type) {
      return this._parsePostMessage(message.data);
    }
  }

  private _parsePostMessage(message: { type: string, content: any }): void {
    switch (message.type) {
      case 'onLiveEntryChange':
        this._liveEntryService.updateLiveStreamEntryByPostMessage(message.content);
        break;
      case 'playerAction':
        if (message.content === 'play') {
          if (this._vdp) {
            this._vdp.sendNotification("doPlay");
            // When player resumes playing push seek bar to live mode
            this._vdp.sendNotification("backToLive");
          }
          this._player.visible = true;
        }
        else if (message.content === 'pause') {
          this._player.visible = false;
          if (this._vdp) {
            this._vdp.sendNotification("doPause");
          }
        }
        break;
      default:
        console.log('Message type unknown!');
    }
  }
}
