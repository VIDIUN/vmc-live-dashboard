import { Injectable } from '@angular/core';
import { VidiunClient } from "@vidiun-ng/vidiun-client";
import { Observable } from "rxjs";

import { ConversionProfileListAction } from "vidiun-typescript-client/types/ConversionProfileListAction";
import { VidiunConversionProfileFilter } from "vidiun-typescript-client/types/VidiunConversionProfileFilter";
import { VidiunConversionProfileType } from "vidiun-typescript-client/types/VidiunConversionProfileType";
import { VidiunConversionProfileListResponse } from "vidiun-typescript-client/types/VidiunConversionProfileListResponse";
import { ConversionProfileAssetParamsListAction } from "vidiun-typescript-client/types/ConversionProfileAssetParamsListAction";
import { VidiunConversionProfileAssetParamsFilter } from "vidiun-typescript-client/types/VidiunConversionProfileAssetParamsFilter";
import { VidiunConversionProfileAssetParamsListResponse } from "vidiun-typescript-client/types/VidiunConversionProfileAssetParamsListResponse";

@Injectable()
export class ConversionProfileService {

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
}
