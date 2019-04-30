import { Injectable } from '@angular/core';
import { VidiunClient, VidiunClientConfiguration } from "@vidiun-ng/vidiun-client";
import { LiveDashboardConfiguration } from "./services/live-dashboard-configuration.service";
import { Observable } from "rxjs/Observable";
import { TranslateService } from "ng2-translate";
import { environment } from "../environments/environment";
import { AppLocalization } from "@vidiun-ng/vidiun-common";

declare var window: any;

@Injectable()
export class BootstrapService {

  constructor(private _vidiunClient: VidiunClient,
              private _vidiunClientConfiguration: VidiunClientConfiguration,
              private _liveDashboardConfiguration: LiveDashboardConfiguration,
              private _appLocalization: AppLocalization) {
  }

  public initialize(): Observable<any> {
    if (window && window.top && window.top.vmc && window.top.vmc.vars && window.top.vmc.vars.liveDashboard) {
      this._liveDashboardConfiguration.vs =           window.top.vmc.vars.vs;
      this._liveDashboardConfiguration.service_url =  window.top.vmc.vars.service_url;
      this._liveDashboardConfiguration.entryId =      window.top.vmc.vars.liveDashboard.entryId;
      this._liveDashboardConfiguration.uiConfId =     window.top.vmc.vars.liveDashboard.uiConfId;
      this._liveDashboardConfiguration.version =      window.top.vmc.vars.liveDashboard.version;
      this._liveDashboardConfiguration.lang =         window.top.lang ? window.top.lang : 'en';
    }

    if (this._liveDashboardConfiguration.vs && this._liveDashboardConfiguration.service_url && this._liveDashboardConfiguration.entryId) {
      this._vidiunClient.vs = this._liveDashboardConfiguration.vs;
      this._vidiunClient.endpointUrl = this._liveDashboardConfiguration.service_url + environment.bootstrap.service_url_extension;
      this._vidiunClientConfiguration.clientTag = 'VidiunLiveDashboard';

      // init i18n - Set english as default language and initialize localization service
      // use only prefix (e.g: all english begin with en-xx)
      let browserLang = this._liveDashboardConfiguration.lang.substr(0, 2);
      return this._appLocalization.load(browserLang, environment.bootstrap.default_lang);
    }
    else {
      return Observable.throw(new Error('missing parameters'));
    }
  }
}
