import { Component, Input, Output, OnInit, OnDestroy, AfterViewInit, EventEmitter } from '@angular/core';

@Component({
    selector: 'v-player',
    templateUrl: './player.component.html',
	styleUrls: ['./player.component.scss']
})
export class VidiunPlayerComponent implements AfterViewInit, OnDestroy {

	@Input()
	width : number|string;

	@Input()
	height : number|string;

	@Input()
	pid : number;

	@Input()
	uiconfid : number;

	@Input()
	entryid : string;

	@Input()
	cdnUrl : string = 'http://cdnapi.vidiun.com';

	@Input()
	flashvars : any = {};

	@Input()
	lazy: boolean = false;

	@Input()
	id : string = "";

	@Output()
	vidiunPlayerReady = new EventEmitter<any>();


	private kdp: any;

	constructor() {}

	public _setSize(parameter: number|string): string {
	  if (typeof parameter === 'string') {
      if (isNaN(parseInt(parameter))) {
        console.log('Error loading player. Parameters are wrong');
      }
      else {
        return `${parameter}%`;
      }
    }
    else {
      return `${parameter}px`;
    }
  }

	ngAfterViewInit(){
		if (!this.lazy){
			this.Embed();
		}
	}

	public Embed():void{
		// validation
		if (!this.pid || !this.uiconfid || !this.entryid){
			console.warn("Vidiun Player::Missing parameters. Please provide pid, uiconfid and entryid.");
		}else {
			// load player lib if doesn't exist
			if (document.getElementById("vidiunPlayerLib") === null) {
				let s = document.createElement('script');
				s.src = `${this.cdnUrl}/p/${this.pid}/sp/${this.pid}00/embedIframeJs/uiconf_id/${this.uiconfid}/partner_id/${this.pid}`;
				s.id = "vidiunPlayerLib";
				s.async = false;
				document.head.appendChild(s);
			}
			// wait for lib to load if not loaded and then embed player
			if (!this.vdp){
				const intervalID = setInterval(() => {
					if (typeof window['vWidget'] !== "undefined"){
						clearInterval(intervalID);
						this.doEmbed();
					}
				},50);
			}else{
				this.doEmbed();
			}
		}
	}

	private doEmbed():void{
		window['vWidget'].embed({
			"targetId": "vidiun_player_" + this.id,
			"wid": "_" + this.pid,
			"uiconf_id": this.uiconfid,
			"flashvars": this.flashvars,
			"cache_st": Math.random(),
			"entry_id": this.entryid,
			"readyCallback": (playerID) => {
				this.vdp = document.getElementById(playerID);
				this.vidiunPlayerReady.emit(this.vdp);
			}
		});
	}

	ngOnDestroy(){
		if (this.vdp){
			window['vWidget'].destroy(this.vdp);
		}
	}

}

