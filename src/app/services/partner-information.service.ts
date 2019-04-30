import { Injectable } from '@angular/core';
import { VidiunClient } from "vidiun-ngx-client";
import { Observable } from "rxjs";

import { ConversionProfileListAction } from "vidiun-ngx-client/api/types/ConversionProfileListAction";
import { VidiunConversionProfileFilter } from "vidiun-ngx-client/api/types/VidiunConversionProfileFilter";
import { VidiunConversionProfileType } from "vidiun-ngx-client/api/types/VidiunConversionProfileType";
import { VidiunConversionProfileListResponse } from "vidiun-ngx-client/api/types/VidiunConversionProfileListResponse";
import { ConversionProfileAssetParamsListAction } from "vidiun-ngx-client/api/types/ConversionProfileAssetParamsListAction";
import { VidiunConversionProfileAssetParamsFilter } from "vidiun-ngx-client/api/types/VidiunConversionProfileAssetParamsFilter";
import { VidiunConversionProfileAssetParamsListResponse } from "vidiun-ngx-client/api/types/VidiunConversionProfileAssetParamsListResponse";
import { UiConfListTemplatesAction } from "vidiun-ngx-client/api/types/UiConfListTemplatesAction";
import { VidiunUiConfFilter } from "vidiun-ngx-client/api/types/VidiunUiConfFilter";
import { VidiunUiConfListResponse } from "vidiun-ngx-client/api/types/VidiunUiConfListResponse";
import { environment } from "../../environments/environment";

@Injectable()
export class PartnerInformationService {

  constructor(private _vidiunClient: VidiunClient) { }

  public getConversionProfiles(): Observable<VidiunConversionProfileListResponse> {
    return this._vidiunClient.request(new ConversionProfileListAction({
      filter: new VidiunConversionProfileFilter({
        typeEqual: VidiunConversionProfileType.liveStream
      })
    }));
  }

  public getConversionProfileFlavors(id: number): Observable<VidiunConversionProfileAssetParamsListResponse> {
    return this._vidiunClient.request(new ConversionProfileAssetParamsListAction({
      filter: new VidiunConversionProfileAssetParamsFilter({
        conversionProfileIdEqual: id
      })
    }));
  }

  public getUiconfIdByTag(): Observable<VidiunUiConfListResponse> {
    return this._vidiunClient.request(new UiConfListTemplatesAction({
      filter: new VidiunUiConfFilter({
        tagsMultiLikeOr: environment.bootstrap.uiConf_id_tag
      })
    }));
  }
}
