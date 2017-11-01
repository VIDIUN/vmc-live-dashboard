// General
import {Injectable, OnDestroy} from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { ISubscription } from "rxjs/Subscription";
import * as _ from 'lodash';
import * as moment from 'moment';

// Services and Configuration
import { KalturaClient } from "@kaltura-ng/kaltura-client";
import { LiveEntryTimerTaskService } from "./entry-timer-task.service";
import { ConversionProfileService } from "./conversion-profile.service";
import { LiveDashboardConfiguration } from "./live-dashboard-configuration.service";
import { environment } from "../../environments/environment";

// Kaltura objects and types
import { KalturaAPIException } from "kaltura-typescript-client";
import { LiveStreamGetAction } from "kaltura-typescript-client/types/LiveStreamGetAction";
import { LiveStreamUpdateAction } from "kaltura-typescript-client/types/LiveStreamUpdateAction";
import { KalturaLiveStreamEntry } from "kaltura-typescript-client/types/KalturaLiveStreamEntry";
import { EntryServerNodeListAction } from "kaltura-typescript-client/types/EntryServerNodeListAction";
import { KalturaEntryServerNodeFilter } from "kaltura-typescript-client/types/KalturaEntryServerNodeFilter";
import { KalturaEntryServerNode } from "kaltura-typescript-client/types/KalturaEntryServerNode";
import { KalturaAssetParamsOrigin } from "kaltura-typescript-client/types/KalturaAssetParamsOrigin";
import { KalturaDVRStatus } from "kaltura-typescript-client/types/KalturaDVRStatus";
import { KalturaRecordStatus } from "kaltura-typescript-client/types/KalturaRecordStatus";
import { KalturaEntryServerNodeStatus } from "kaltura-typescript-client/types/KalturaEntryServerNodeStatus";
import { KalturaLiveStreamAdminEntry } from "kaltura-typescript-client/types/KalturaLiveStreamAdminEntry";
import { KalturaLiveEntryServerNode } from "kaltura-typescript-client/types/KalturaLiveEntryServerNode";
import { KalturaEntryServerNodeType } from "kaltura-typescript-client/types/KalturaEntryServerNodeType";
import { BeaconListAction } from "kaltura-typescript-client/types/BeaconListAction";
import { KalturaBeaconFilter } from "kaltura-typescript-client/types/KalturaBeaconFilter";
import { KalturaFilterPager } from "kaltura-typescript-client/types/KalturaFilterPager";
import { KalturaBeaconIndexType } from "kaltura-typescript-client/types/KalturaBeaconIndexType";
import { KalturaBeacon } from "kaltura-typescript-client/types/KalturaBeacon";
import { LiveReportsGetEventsAction } from "kaltura-typescript-client/types/LiveReportsGetEventsAction";
import { KalturaLiveReportType } from "kaltura-typescript-client/types/KalturaLiveReportType";
import { KalturaLiveReportInputFilter } from "kaltura-typescript-client/types/KalturaLiveReportInputFilter";
import { KalturaReportGraph } from "kaltura-typescript-client/types/KalturaReportGraph";
import { KalturaNullableBoolean } from "kaltura-typescript-client/types/KalturaNullableBoolean";
// Types
import {
  LiveStreamStates, LiveStreamSession, LiveEntryDynamicStreamInfo, LiveEntryStaticConfiguration,
  ApplicationStatus, LoadingStatus, LiveEntryDiagnosticsInfo, StreamHealth, DiagnosticsHealthInfo,
  DiagnosticsDynamicInfo
} from "../types/live-dashboard.types";
// Pipes
import { CodeToSeverityPipe } from "../pipes/code-to-severity.pipe";
import { StreamStatusPipe } from "../pipes/stream-status.pipe";

@Injectable()
export class LiveEntryService implements OnDestroy {

  // BehaviorSubject subscribed by application
  private _applicationStatus = new BehaviorSubject<ApplicationStatus>({
    streamStatus: LoadingStatus.initializing,
    streamHealth: LoadingStatus.initializing,
    liveEntry: LoadingStatus.initializing
  });
  public  applicationStatus$ = this._applicationStatus.asObservable();
  private _liveStreamGetSubscription: ISubscription;
  // BehaviorSubjects subscribed by settings components for manipulation
  private _liveStream = new BehaviorSubject<KalturaLiveStreamEntry>(null);
  public  liveStream$ = this._liveStream.asObservable();
  private _cachedLiveStream: KalturaLiveStreamEntry;
  // BehaviorSubjects subscribed by configuration display component for status monitoring
  private _entryStaticConfiguration = new BehaviorSubject<LiveEntryStaticConfiguration>(null);
  public  entryStaticConfiguration$ = this._entryStaticConfiguration.asObservable();
  private _entryDynamicInformation = new BehaviorSubject<LiveEntryDynamicStreamInfo>({
    streamStatus: {
      state: 'Offline'
    },
    streamSession: {
      isInProgress: false,
      timerStartTime: Date.now(),
      shouldTimerRun: false
    }
  });
  public  entryDynamicInformation$ = this._entryDynamicInformation.asObservable();
  // BehaviorSubjects subscribed by configuration display component for diagnostics and health monitoring
  private _entryDiagnostics = new BehaviorSubject<LiveEntryDiagnosticsInfo>({
    staticInfoPrimary: { updatedTime: 0 },
    staticInfoSecondary: { updatedTime: 0 },
    dynamicInfoPrimary: { updatedTime: 0 },
    dynamicInfoSecondary: { updatedTime: 0 },
    streamHealth: { updatedTime: Date.now(), data: { primary: [], secondary: [] } }
  });
  public  entryDiagnostics$ = this._entryDiagnostics.asObservable();

  private _subscriptionEntryStatusMonitoring: ISubscription;
  private _subscriptionStreamHealthInitialization: ISubscription;
  private _subscriptionStreamHealthMonitoring: ISubscription;
  private _subscriptionDiagnosticsMonitoring: ISubscription;

  // BehaviorSubject to show number of watchers when stream is Live
  private _numOfWatcherSubject = new BehaviorSubject<KalturaReportGraph[]>(null);
  public numOfWatcher$ = this._numOfWatcherSubject.asObservable();
  private _numOfWatchersTimerSubscription: Subscription = null;

  constructor(private _kalturaClient: KalturaClient,
              private _entryTimerTask: LiveEntryTimerTaskService,
              private _conversionProfilesService: ConversionProfileService,
              private _liveDashboardConfiguration: LiveDashboardConfiguration,
              private _codeToSeverityPipe: CodeToSeverityPipe,
              private _streamStatusPipe: StreamStatusPipe) {
  }

  ngOnDestroy() {
    this._liveStream.unsubscribe();
    this._subscriptionEntryStatusMonitoring.unsubscribe();
    this._subscriptionStreamHealthInitialization.unsubscribe();
    this._subscriptionStreamHealthMonitoring.unsubscribe();
    this._subscriptionDiagnosticsMonitoring.unsubscribe();
    if (this._liveStreamGetSubscription) {
      this._liveStreamGetSubscription.unsubscribe();
    }

    if (this._numOfWatchersTimerSubscription) {
      this._numOfWatchersTimerSubscription.unsubscribe();
      this._numOfWatchersTimerSubscription = null;
    }
  }

  public InitializeLiveEntryService(): void {
    this._getLiveStream();
    this._runEntryStatusMonitoring();
    this._runDiagnosticsDataMonitoring();
    this._streamHealthInitialization();
    this._listenToNumOfWatcherWhenLive();
  }

  private _updatedApplicationStatus(key: string, value: LoadingStatus): void {
    const newAppStatus = this._applicationStatus.getValue();

    switch (key) {
      case 'streamStatus':
        newAppStatus.streamStatus = value;
        break;
      case 'streamHealth':
        newAppStatus.streamHealth = value;
        break;
      case 'liveEntry':
        newAppStatus.liveEntry = value;
        break;
    }

    this._applicationStatus.next(newAppStatus);
  }

  private _getLiveStream(): void {
    this._liveStreamGetSubscription = this._kalturaClient.request(new LiveStreamGetAction({
        entryId : this._liveDashboardConfiguration.entryId,
        acceptedTypes : [KalturaLiveStreamAdminEntry, KalturaLiveEntryServerNode]
      }))
      .subscribe(response => {
        this._liveStreamGetSubscription = null;
        this._cachedLiveStream = JSON.parse(JSON.stringify(response));
        this._liveStream.next(response);
        this._parseEntryConfiguration(response);
        // Run data monitoring only if successfully retrieved liveStream object
      },
        error => {
          this._liveStreamGetSubscription = null;
          if (error instanceof KalturaAPIException) {
            console.log(`[LiveStreamGet] Error: ${error.message}`);
            this._updatedApplicationStatus('liveEntry', LoadingStatus.failed);
          }
        });
  }

  private _parseEntryConfiguration(liveEntryObj: KalturaLiveStreamEntry): void {
    let entryConfig: LiveEntryStaticConfiguration = {};
    this._conversionProfilesService.getConversionProfileFlavors(liveEntryObj.conversionProfileId)
      .subscribe(response => {
        entryConfig.dvr = (liveEntryObj.dvrStatus === KalturaDVRStatus.enabled);
        entryConfig.recording = (liveEntryObj.recordStatus !== KalturaRecordStatus.disabled);
        // Look through the array and find the first flavor that is transcoded
        let isTranscodedFlavor = response.objects.find(f => { return f.origin ===  KalturaAssetParamsOrigin.convert });
        entryConfig.transcoding = isTranscodedFlavor ? true : false;
        this._entryStaticConfiguration.next(entryConfig);
        this._updatedApplicationStatus('liveEntry', LoadingStatus.succeeded);
        console.log(`[LiveStreamGet] Finished successfully`);
      });
  }

  private _runEntryStatusMonitoring(): void {
    this._subscriptionEntryStatusMonitoring = this._entryTimerTask.runTimer(() => {
      return this._kalturaClient.request(new EntryServerNodeListAction({
        filter: new KalturaEntryServerNodeFilter({entryIdEqual: this._liveDashboardConfiguration.entryId})
      }))
        .do(response => {
          // Make sure primary entryServerNode is first in array
          this._parseEntryServeNodeList(_.sortBy(response.objects, 'serverType'));
          this._updatedApplicationStatus('streamStatus', LoadingStatus.succeeded);
          return;
        })
    }, environment.liveEntryService.stream_status_interval_time_in_ms, true)
      .subscribe(response => {
        if (response.error instanceof KalturaAPIException) {
          console.log(`[EntryServeNodeList] Error: ${response.error.message}`);
          this._updatedApplicationStatus('streamStatus', LoadingStatus.failed);
        }
      });
  }

  private _parseEntryServeNodeList(snList: KalturaEntryServerNode[]): void {
    let dynamicConfigObj = this._entryDynamicInformation.getValue();
    // Check redundancy if more than one serverNode was returned
    dynamicConfigObj.redundancy = this._getRedundancyStatus(snList);
    let newStreamState = this._getStreamStatus(snList, dynamicConfigObj);
    this._streamSessionStateUpdate(dynamicConfigObj.streamStatus.state, newStreamState.state, dynamicConfigObj.streamSession);
    dynamicConfigObj.streamStatus = newStreamState;
    this._updateStreamCreationTime(snList, dynamicConfigObj);

    this._entryDynamicInformation.next(dynamicConfigObj);
  }

  private _getRedundancyStatus(serverNodeList: KalturaEntryServerNode[]): boolean {
    if (serverNodeList.length > 1) {
      return serverNodeList.every(sn => sn.status !== KalturaEntryServerNodeStatus.markedForDeletion);
    }
    return false;
  }

  private _getStreamStatus(serverNodeList: KalturaEntryServerNode[], currentInfo: LiveEntryDynamicStreamInfo): LiveStreamStates {
    // Possible scenarios for streamStatus:
    // (1) If only primary -> StreamStatus equals primary status
    // (2) If only secondary -> StreamStatus equals secondary status
    // (3) If both -> StreamStatus equals the same as recent active
    if (currentInfo.redundancy) {
      if (!currentInfo.streamStatus.serverType || (KalturaEntryServerNodeType.livePrimary.equals(currentInfo.streamStatus.serverType))) {
        return {
          state: this._streamStatusPipe.transform(serverNodeList[0].status),
          serverType: KalturaEntryServerNodeType.livePrimary
        };
      }
      else if (KalturaEntryServerNodeType.liveBackup.equals(currentInfo.streamStatus.serverType)) {
        return {
          state: this._streamStatusPipe.transform(serverNodeList[1].status),
          serverType: KalturaEntryServerNodeType.liveBackup
        };
      }
    }
    else {
      if (serverNodeList.length) {
        let sn = serverNodeList.find(esn => { return esn.status !== KalturaEntryServerNodeStatus.markedForDeletion });
        if (sn) {
          return {
            state: this._streamStatusPipe.transform(sn.status),
            serverType: sn.serverType
          };
        }
      }
      return {
        state: this._streamStatusPipe.transform(KalturaEntryServerNodeStatus.stopped)
      }
    }
  }

  private _streamSessionStateUpdate(currentState: string, nextState: string, session: LiveStreamSession): void {
    // Session is in progress on only when in Live state
    if (currentState !== 'Live' && nextState === 'Live') {
      session.isInProgress = true;
      session.shouldTimerRun = false;
    }
    // If stream is not longer live, start grace period timer
    if (currentState === 'Live' && nextState === 'Offline') {
      session.shouldTimerRun = true;
      session.timerStartTime = Date.now();
    }
    // If timer is running check if session grace period expired
    if (session.shouldTimerRun && (Date.now() - session.timerStartTime > environment.liveEntryService.stream_session_grace_period_in_ms)) {
      session.isInProgress = false;
    }
  }

  private _updateStreamCreationTime(serverNodeList: KalturaEntryServerNode[], dynamicInfoObj: LiveEntryDynamicStreamInfo): void {
    if (serverNodeList.length > 0) {
      dynamicInfoObj.streamCreationTime = serverNodeList[0].createdAt ? serverNodeList[0].createdAt.valueOf() : null;
      // find all primary & secondary streams and find earliest createdAt stream time
      serverNodeList.forEach((eServerNode) => {
        // get the earliest eServerNode.createdAt time available
        if (moment(eServerNode.createdAt).isBefore(dynamicInfoObj.streamCreationTime)) {
          dynamicInfoObj.streamCreationTime = eServerNode.createdAt.valueOf();
        }
      });
    }
  }

  private _streamHealthInitialization(): void {
    this._subscriptionStreamHealthInitialization = this._kalturaClient.request(new BeaconListAction({
      filter: new KalturaBeaconFilter({
        orderBy: '-updatedAt',
        eventTypeIn: '0_healthData,1_healthData',
        objectIdIn: this._liveDashboardConfiguration.entryId,
        indexTypeEqual: KalturaBeaconIndexType.log
      }),
      pager: new KalturaFilterPager({
        pageSize: environment.liveEntryService.max_beacon_health_reports_to_show
      })
    }))
    .subscribe(response => {
      this._parseBeacons(response.objects, true);
      this._updatedApplicationStatus('streamHealth', LoadingStatus.succeeded);
      this._runStreamHealthMonitoring();
    })
  }

  private _runStreamHealthMonitoring(): void {
    this._subscriptionStreamHealthMonitoring = this._entryTimerTask.runTimer(() => {
      let lastUpdateTime = this._entryDiagnostics.getValue().streamHealth.updatedTime;
      return this._kalturaClient.request(new BeaconListAction({
        filter: new KalturaBeaconFilter({
          orderBy: '-updatedAt',
          updatedAtGreaterThanOrEqual: new Date(lastUpdateTime),
          eventTypeIn: '0_healthData,1_healthData',
          objectIdIn: this._liveDashboardConfiguration.entryId,
          indexTypeEqual: KalturaBeaconIndexType.log
        })
      }))
        .do(response => {
          // Update diagnostics object with recent health beacons
          this._parseBeacons(response.objects, true);
          return;
        })
    }, environment.liveEntryService.stream_health_interval_time_in_ms)
      .subscribe(response => {
        if (response.error instanceof KalturaAPIException) {
          console.log(`[BeaconHealthMonitoring] Error: ${response.error.message}`);
        }
      });
  }

  private _runDiagnosticsDataMonitoring(): void {
    this._subscriptionDiagnosticsMonitoring = this._entryTimerTask.runTimer(() => {
      return this._kalturaClient.request(new BeaconListAction({
        filter: new KalturaBeaconFilter({
          eventTypeIn: '0_staticData,0_dynamicData,1_staticData,1_dynamicData',
          objectIdIn: this._liveDashboardConfiguration.entryId,
          indexTypeEqual: KalturaBeaconIndexType.state
        })
      }))
        .do(response => {
          // Update diagnostics object with recent data beacons
          this._parseBeacons(response.objects);
        })
    }, environment.liveEntryService.stream_diagnostics_interval_time_in_ms, true)
      .subscribe(response => {
        if (response.error instanceof KalturaAPIException) {
          console.log(`[BeaconDiagnosticsMonitoring] Error: ${response.error.message}`);
        }
      })
  }

  private _parseBeacons(beaconsArray: KalturaBeacon[], isLoggedType = false): void {
    let entryDiagnosticsObject = this._entryDiagnostics.getValue();

    if (beaconsArray.length && isLoggedType) {
      // Make sure last beacon's updatedTime in the array matches the last one received by service and remove it.
      if (entryDiagnosticsObject.streamHealth.updatedTime === beaconsArray[beaconsArray.length - 1].updatedAt.valueOf()) {
        beaconsArray.pop();
      }
    }
    // Iterate through beacons list from oldest report to most recent
    _.eachRight(beaconsArray, b => {
      let privateData = JSON.parse(b.privateData);
      let eventType = b.eventType.substring(2);
      let isPrimary = (b.eventType[0] === '0');
      let beaconUpdateTime = b.updatedAt.valueOf();

      let objectToUpdate = this._getDiagnosticsObjToUpdate(entryDiagnosticsObject, eventType, isPrimary);
      if (objectToUpdate && (beaconUpdateTime !== objectToUpdate.updatedTime)) {
        if (eventType === 'healthData') {
          this._handleHealthBeacon(beaconUpdateTime, isPrimary, privateData, objectToUpdate);
        }
        else {
          objectToUpdate.data = privateData;
        }
      }
      // Only if beacon report time is higher (meaning more recent) than last one saved, replace it
      if (beaconUpdateTime > objectToUpdate.updatedTime) {
        objectToUpdate.updatedTime = beaconUpdateTime;
      }
    });

    this._entryDiagnostics.next(entryDiagnosticsObject);
  }

  private _handleHealthBeacon(beaconTime: number, isPrimary: boolean, metaData: any, diagnosticsObject: { updatedTime?: number, data?: DiagnosticsHealthInfo }): void {
    let report = {
      updatedTime: beaconTime,
      severity: metaData.maxSeverity,
      isPrimary: isPrimary,
      alerts: _.isArray(metaData.alerts) ? _.uniqBy(metaData.alerts, 'Code') : []
    };
    // sort alerts by their severity (-desc)
    report.alerts = (_.sortBy(report.alerts, [(alert) => {
      return -this._codeToSeverityPipe.transform(alert.Code).valueOf();
    }]));
    // For each report add it to the beginning of the array.
    // If array contains the maximum number of elements allowed, erase the last one and add the most recent one.
    if (isPrimary) {
      if ((<StreamHealth[]>diagnosticsObject.data.primary).length === environment.healthNotifications.max_notifications_to_display) {
        (<StreamHealth[]>diagnosticsObject.data.primary).pop();
      }
      (<StreamHealth[]>diagnosticsObject.data.primary).splice(0, 0, report);
    }
    else {
      if ((<StreamHealth[]>diagnosticsObject.data.secondary).length === environment.healthNotifications.max_notifications_to_display) {
        (<StreamHealth[]>diagnosticsObject.data.secondary).pop();
      }
      (<StreamHealth[]>diagnosticsObject.data.secondary).splice(0, 0, report);
    }
  }

  private _getDiagnosticsObjToUpdate(entryDiagnosticsObject: LiveEntryDiagnosticsInfo, event: string, isPrimary: boolean): { updatedTime?: number, data?: Object | DiagnosticsDynamicInfo | DiagnosticsHealthInfo } {
    switch(event) {
      case 'staticData':
        return (isPrimary) ? entryDiagnosticsObject.staticInfoPrimary : entryDiagnosticsObject.staticInfoSecondary;
      case 'dynamicData':
        return (isPrimary) ? entryDiagnosticsObject.dynamicInfoPrimary : entryDiagnosticsObject.dynamicInfoSecondary;
      case 'healthData':
        return entryDiagnosticsObject.streamHealth;
      default:
        console.log(`Beacon event Type unknown: ${event}`);
        return null;
    }
  }

  private _listenToNumOfWatcherWhenLive(): void {
    // init the timer
    let numOfWatcherTimer$ = this._entryTimerTask.runTimer(() => {
        return this._getNumOfWatchers();
      }, environment.liveEntryService.live_analytics_interval_time_in_ms);

    // On Live  -> Subscribe (get api call of num of watchers)
    // Else     -> Unsubscribe
    this._entryDynamicInformation.subscribe((dynamicInfo) => {
      if (dynamicInfo && dynamicInfo.streamStatus.state === 'Live') {
        if(this._numOfWatchersTimerSubscription === null) {
          this._numOfWatchersTimerSubscription = numOfWatcherTimer$.subscribe((response) => {
            if (response['status'] === 'timeout') {
              console.log('Live Entry: Error at getNumOfWatchers request.')
            }
          });
        }
      }
      else if (this._numOfWatchersTimerSubscription) {
        // Erase last graph value in the behavior subject so component will know to stop displaying watchers
        this._numOfWatcherSubject.next(null);
        this._numOfWatchersTimerSubscription.unsubscribe();
        this._numOfWatchersTimerSubscription = null;
      }
    });
  }

  private _getNumOfWatchers(): Observable<KalturaReportGraph[]> {
    // Get results for a 90 sec window
    let liveReportsRequest = new LiveReportsGetEventsAction({
      reportType: KalturaLiveReportType.entryTimeLine,
      filter: new KalturaLiveReportInputFilter({
        entryIds: this._liveDashboardConfiguration.entryId,
        fromTime: moment().subtract(110, 'seconds').toDate(),
        toTime: moment().subtract(20, 'seconds').toDate(),
        live: KalturaNullableBoolean.trueValue
      })
    });

    return this._kalturaClient.request(liveReportsRequest)
      .do(response => {
          this._numOfWatcherSubject.next(response);
        },
        error => {
          console.log(`Error get number of watchers; Error: ${error.message}`);
        });
  }

  public updateLiveStreamEntry(propertiesToUpdate: string[]) {
    let liveStreamEntryArg = new KalturaLiveStreamEntry();

    propertiesToUpdate.forEach(p => {
      liveStreamEntryArg[p] = this._liveStream.value[p];
    });

    const liveStreamUpdateSubscription = this._kalturaClient.request(new LiveStreamUpdateAction({
      entryId: this._liveDashboardConfiguration.entryId,
      liveStreamEntry: liveStreamEntryArg
    }))
      .subscribe(response => {
        this._liveStream.next(response);
        liveStreamUpdateSubscription.unsubscribe();
      })
  }
}
