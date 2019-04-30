import { Injectable } from '@angular/core';
import { VidiunAPIClient } from './vidiun-api/vidiun-api-client';
import { EntryServerNodeService } from './vidiun-api/entry-server-node/entry-server-node.service';
import { LiveStreamService } from './vidiun-api/live-stream/live-stream.service';
import { LiveAnalyticsService } from './vidiun-api/live-analytics/live-analytics.service';
import { VidiunMultiRequest } from './vidiun-api/vidiun-multi-request';
import { Observable } from 'rxjs/Observable';
import {Message} from 'primeng/primeng';
import {LocalStorage} from 'ng2-webstorage';

import * as _ from "lodash";


export class Stream {
    isPrimary: boolean;
    flavorId: string;
    bitrate: number;
    width: number;
    height: number;
    fps: number;
    isTranscoded: boolean;
    keyFrameInterval: number;
    samplingRate: number;
}

export class InputEncoderSettings {
    video_codec: string;
    video_bitrate: number;
    video_fps: number;
    audio_codec: string;
    audio_samplingRate: number;
}
export class Input {
    server: string;
    index: number;
    uptime: string;
    bitrate: number;
    address: string;
    encoderSettings: InputEncoderSettings;
}

export class EntryServerNode {
    inputStreams: Input[];
    outputStreams: Stream[];

}

export class LiveEntry {
    constructor(apiEntry) {
        this.id = apiEntry.id;
        this.name = apiEntry.name;
        this.tags=apiEntry.tags;
        this.createdAt = apiEntry.createdAt;
        this.liveStatus = apiEntry.liveStatus;
        this.thumbnailUrl = apiEntry.thumbnailUrl;
        this.duration = apiEntry.duration;
        this.plays = apiEntry.plays;
        this.startTime = new Date();
        this.entryServerNodes = []
        this.mediaType = apiEntry.mediaType;
        this.dvrStatus = apiEntry.dvrStatus;
        this.dvrWindow = apiEntry.dvrWindow;
        this.recordStatus = apiEntry.recordStatus;
    }
    entryServerNodes: EntryServerNode[];
    id: string;
    tags:string;
    name: string;
    thumbnailUrl: string;
    mediaType: string;
    plays: string;
    createdAt: string;
    duration: string;
    liveStatus: number;
    dvrWindow: number;
    recordStatus: number;
    dvrStatus: boolean;
    redundant:boolean =false;
    startTime:Date = null;
    flavors: number = null;
    audience: number = null;
    alerts: Message[] = [];

    public clearEntryServerNodes() {
        this.entryServerNodes=[];
    }

    public addEntryServerNode(entryServerNode) {
        this.entryServerNodes.push(entryServerNode);

        entryServerNode.inputStreams = [
            {server:"abc",
                index: 1,
                uptime: "00:10:00",
                bitrate: 500,
                address: "128.5.4.3:3000",
                encoderSettings: {
                    video_codec: "H264",
                    video_bitrate: 100000,
                    video_fps: 30,
                    audio_codec: "AAC",
                    audio_samplingRate: "44100"
                }
            }];
        entryServerNode.outputStreams=[];
        entryServerNode.isPrimary = (entryServerNode.serverType==0);

        entryServerNode.streams.forEach( (stream) => {
            let outputstream = new Stream();
            outputstream.bitrate = stream.bitrate;
            outputstream.height = stream.height;
            outputstream.width = stream.width;
            outputstream.flavorId = stream.flavorId;
            outputstream.isTranscoded = true;
            entryServerNode.outputStreams.push(outputstream);
        });
        this.alerts.push({severity:'info', summary:'Key frame interval is not good', detail:'CHANGE IT '});
        this.alerts.push({severity:'warn', summary:'Not recieving video', detail:'problem! '});

        this.flavors = entryServerNode.streams.length;
        this.redundant = (this.entryServerNodes.length > 1);
        if (!this.startTime  || this.startTime.getTime()>entryServerNode.createdAt*1000)
        {
            this.startTime = new Date(entryServerNode.createdAt*1000);
        }
//        console.warn(`Updated entry ${this.id}`)

    }

    get isFavorite(): boolean {
        return this.tags.indexOf(LiveEntryService.LIVE_DASHBOARD_FAVORITE_TAG) >= 0;
    }

    set isFavorite(value: boolean) {
        if (value ) {
            if (!this.isFavorite) {
                this.tags = this.tags + ',' + LiveEntryService.LIVE_DASHBOARD_FAVORITE_TAG;
            }
        } else {
            this.tags = _.replace(this.tags, LiveEntryService.LIVE_DASHBOARD_FAVORITE_TAG, '');
        }

        //fix unwanted commas in tags string
        this.tags = this.tags.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',');
    }

    updateFromAnalyticData(analyticsData:any) {
        let audienceData = _.split(analyticsData['data'], ';');

        //for some reason the audience array contains redundant empty strings (god knows why - but we need to deal with it)
        for (let i = audienceData.length-1; i >=0; i--) {
            let lastValidData = audienceData[i];
            if (!_.isEmpty(lastValidData)) {
                let lastUpdatedArray = _.split(lastValidData, ',');
                if ( lastUpdatedArray && lastUpdatedArray.length>=1 ) {
                    this.audience =  parseFloat(lastUpdatedArray[1]);
                    return;
                }
            }
        }
        this.audience=0;
    }



}


@Injectable()
export class LiveEntryService {

    public static LIVE_DASHBOARD_FAVORITE_TAG = 'live-dashboard-favorite';


    private entries$:Observable<any>;

    private filter:any;
    private responseProfile:any;
    public pageSize:number;
    public totalEntries:number;

    @LocalStorage('liveOnly')
    public liveOnly: boolean ;

    @LocalStorage('favoritesOnly')
    public favoritesOnly: boolean ;

    public searchText:string='';
    public entries: LiveEntry[];
    public analyticsRefreshInterval:number = 60;
    public entryServerNodeRefreshInterval:number = 60;
    private id2entry : Map<string,LiveEntry> = new Map<string,LiveEntry>();

    constructor(private vidiunAPIClient:VidiunAPIClient) {

        if (this.liveOnly===null) {
            this.liveOnly=false;
        }
        if (this.favoritesOnly===null) {
            this.favoritesOnly=false;
        }
        this.filter = {
            "objectType": "VidiunLiveStreamEntryFilter",
            "orderBy": "-createdAt"
        };
        this.responseProfile = {
            "objectType": "VidiunDetachedResponseProfile",
            "type": "1",
            "fields": "id,name,thumbnailUrl,liveStatus,recordStatus,dvrStatus,dvrWindow,tags",
            "relatedProfiles:0:objectType": "VidiunDetachedResponseProfile",
            "relatedProfiles:0:type": 1,
            "relatedProfiles:0:fields": "id",
            "relatedProfiles:0:filter:objectType": "VidiunEntryServerNodeFilter",
            "relatedProfiles:0:mappings:0:objectType": "VidiunResponseProfileMapping",
            "relatedProfiles:0:mappings:0:parentProperty": "id",
            "relatedProfiles:0:mappings:0:filterProperty": "entryIdEqual"
        };



    }

    list(pageIndex,pageSize):Observable<any> {

        if (this.favoritesOnly) {
            this.filter["tagsLike"] = LiveEntryService.LIVE_DASHBOARD_FAVORITE_TAG;
        } else {
            delete this.filter["tagsLike"];
        }
        if (this.liveOnly) {
            this.filter["isLive"] = true;
        } else {
            delete this.filter["isLive"];
        }
        this.id2entry.clear();

        this.entries$ = LiveStreamService.list(this.searchText, this.filter, this.responseProfile,pageSize,pageIndex)
                    .execute(this.vidiunAPIClient)
                    .map(response => {
                        this.totalEntries=response.totalCount;

                        this.entries = response.objects.map( (apiEntry) => {
                            let obj=new LiveEntry(apiEntry);
                            this.id2entry.set(obj.id,obj);
                            return obj;
                        });
                        this.getAnalyticsData();

                        return this.getEntryServerNodeData();
                    });

        return this.entries$;
    }






    private getEntryServerNodeData() {

        let liveEntriesIds = Array.from(this.id2entry.keys());
        if (liveEntriesIds.length==0) {
            return;
        }
        let filter = {
            'entryIdIn': _.join(liveEntriesIds)
        };


        return EntryServerNodeService.list(filter).execute(this.vidiunAPIClient).toPromise()
            .then(results => {


                this.handleEntryServerNodeResult(results);

                if (this.entryServerNodeRefreshInterval>0) {
                    let timer = Observable.timer(this.entryServerNodeRefreshInterval * 1000);
                    timer.subscribe(t=> {
                        this.getEntryServerNodeData();
                    });
                }

            })
            .catch(error => {
                console.log(error)
            });
    }

    private handleEntryServerNodeResult(entryServerNodeResult) {

        this.id2entry.forEach( (entry, id) => {
            entry.clearEntryServerNodes();
        });

        _.each(entryServerNodeResult.objects, (entryServerNode) => {
            let liveEntry = this.id2entry.get(entryServerNode.entryId);
            if (!liveEntry) {
                return;
            }
            liveEntry.addEntryServerNode(entryServerNode);
        });


    }

    saveTag(entry:LiveEntry) {

        let liveStreamEntry = {
            'liveStreamEntry:objectType': 'VidiunLiveStreamEntry',
            'liveStreamEntry:tags': entry.tags
        };

        LiveStreamService.update(entry.id, liveStreamEntry)
            .execute(this.vidiunAPIClient)
            .toPromise()
            .catch((reason) => console.log('ERROR: filed to update entry tags. ' + reason));
    }






    private getAnalyticsData() {
        let multiRequest = new VidiunMultiRequest();

        let entries :LiveEntry[]=[];

        this.id2entry.forEach( (entry, entryId) => {

            if (entry.liveStatus>0) {
                let filter = {
                    'entryIds': entryId,
                    'fromTime': -129600,
                    'toTime': -2
                };
                entries.push(entry);
                multiRequest.addRequest(LiveAnalyticsService.getEvents('ENTRY_TIME_LINE', filter));
            } else {
                entry.audience=0;
            }
        });

        if (entries.length>0) {
            multiRequest.execute(this.vidiunAPIClient).toPromise()
                .then(results => {
                    this.handleAnalyticsData(entries, results)
                })
                .catch(error => {
                    console.log(error)
                });
        }


        if (this.analyticsRefreshInterval>0) {
            let timer = Observable.timer(this.analyticsRefreshInterval * 1000);
            timer.subscribe(t=> {
                this.getAnalyticsData();
            });
        }
    }

    private handleAnalyticsData(liveEntries :LiveEntry[],analyticsDatas) {
        _.each(analyticsDatas, (analyticsData, index) => {

             let liveEntry = liveEntries[index];
             if (!liveEntry) {
                 return;
             }
             liveEntry.updateFromAnalyticData(analyticsData[0]);
         });
    }

}
