import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import * as _ from "lodash";
import {LiveEntry} from "../entry.service";
import {UIConfService} from "../vidiun-api/ui-conf/uiConf.service";
import { VidiunAPIClient } from '../vidiun-api/vidiun-api-client';
import {SelectItem,DropdownModule} from 'primeng/primeng';
import {LocalStorage} from 'ng2-webstorage';

@Component({
    selector: 'vmc-live-entry-video-preview',
    templateUrl: './app/components/live-entry-video-preview.component.html',
    styleUrls: ['./app/components/live-entry-video-preview.component.css']
})


export class LiveEntryVideoPreviewComponent implements OnInit {

    @Input() entry : LiveEntry;

    players: SelectItem[] =[];

    @LocalStorage('selectedPlayer')
    public selectedPlayer:string;

    public partnerId: number  =1802381;
    constructor(private vidiunAPIClient: VidiunAPIClient) {

    }

    get playerIFrameUrl() {
        return "https://cdnapisec.vidiun.com/p/"+this.partnerId+"/sp/"+this.partnerId+"00/embedIframeJs/uiconf_id/"+this.selectedPlayer+"/partner_id/"+this.partnerId+"?iframeembed=true&playerId=vidiun_player_1480260391&entry_id="+this.entry.id+"&flashvars[streamerType]=auto";

    }

    refreshPlayers() {
        UIConfService.list().execute(this.vidiunAPIClient).toPromise()
            .then(results => {
                this.players=results.objects.map( (obj) => {
                    return {label:obj.name, value: obj.id};
                });
            });
    }

    ngOnInit() {
        this.refreshPlayers();
    }

    ngOnDestroy() {

    }

    openEntry() {
    }
}