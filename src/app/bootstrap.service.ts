import { Injectable } from '@angular/core';
import { VidiunClient } from "vidiun-ngx-client";
import { LiveDashboardConfiguration } from "./services/live-dashboard-configuration.service";
import { Observable } from "rxjs/Observable";
import { environment } from "../environments/environment";
import { AppLocalization } from "@vidiun-ng/vidiun-common";
import { ApplicationMode } from "./types/live-dashboard.types";

declare var window: any;

@Injectable()
export class BootstrapService {

  constructor(private _vidiunClient: VidiunClient,
              private _liveDashboardConfiguration: LiveDashboardConfiguration,
              private _appLocalization: AppLocalization) {
  }

  public initialize(): Observable<any> {
    if (window && window.top) {
      this._liveDashboardConfiguration.player = {};

      if (window.top.vmc && window.top.vmc.vars && window.top.vmc.vars.liveDashboard) {
        this._liveDashboardConfiguration.mode =             ApplicationMode.Default;
        this._liveDashboardConfiguration.vs =               window.top.vmc.vars.vs;
        this._liveDashboardConfiguration.service_url =      window.top.vmc.vars.service_url;
        this._liveDashboardConfiguration.entryId =          window.top.vmc.vars.liveDashboard.entryId;
        this._liveDashboardConfiguration.lang =             window.top.lang ? window.top.lang : 'en';
      }
      else if (window.top.webcast && window.top.webcast.vars && window.top.webcast.vars.liveDashboard) {
        this._liveDashboardConfiguration.mode =             window.top.webcast.vars.liveDashboard.mode === 'webcast' ? ApplicationMode.Webcast : ApplicationMode.Default;
        this._liveDashboardConfiguration.vs =               window.top.webcast.vars.liveDashboard.vs;
        this._liveDashboardConfiguration.service_url =      window.top.webcast.vars.liveDashboard.service_url;
        this._liveDashboardConfiguration.entryId =          window.top.webcast.vars.liveDashboard.entryId;
        this._liveDashboardConfiguration.lang =             window.top.webcast.vars.liveDashboard.lang ? window.top.webcast.vars.liveDashboard.lang : 'en';
      }
    }

    if (this._liveDashboardConfiguration.vs && this._liveDashboardConfiguration.service_url && this._liveDashboardConfiguration.entryId) {
      this._liveDashboardConfiguration.version = environment.version;
      this._vidiunClient.setDefaultRequestOptions({
        vs: this._liveDashboardConfiguration.vs,
      });
      this._vidiunClient.setOptions({
        endpointUrl: this._liveDashboardConfiguration.service_url + environment.bootstrap.service_url_extension,
        clientTag: 'VidiunLiveDashboard'
      });

      console.log('Bootstrap service started successfully');
      // init i18n - Set english as default language and initialize localization service
      // use only prefix (e.g: all english begin with en-xx)
      let browserLang = this._liveDashboardConfiguration.lang.substr(0, 2);
      return this._appLocalization.load(browserLang, environment.bootstrap.default_lang);
    }
    else {
      console.log('Bootstrap service failed to start');
      return Observable.throw(new Error('missing parameters'));
    }
  }
}
