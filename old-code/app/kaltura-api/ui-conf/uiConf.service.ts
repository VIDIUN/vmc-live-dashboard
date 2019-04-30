import { Injectable } from '@angular/core';

import {VidiunRequest} from "../vidiun-request";

@Injectable()
export class UIConfService {

  constructor(){
  }

  public static list(): VidiunRequest<any> {

    let responseProfile:any = {
      "objectType": "VidiunDetachedResponseProfile",
      "type": "1",
      "fields": "id,name"
    };

    const parameters :any = {
      pager: {
        objectType: "VidiunFilterPager",
        pageSize: 1000,
        pageIndex: 1
      },
      responseProfile: Object.assign({}, responseProfile),
      filter: { "objTypeEqual": 1 }
    };
    return new VidiunRequest<any>('uiconf', 'list', parameters);
  }


}
