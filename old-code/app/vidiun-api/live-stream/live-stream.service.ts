import { Injectable } from '@angular/core';

import {VidiunRequest} from "../vidiun-request";

@Injectable()
export class LiveStreamService {

  constructor(){
  }

  static list(search: string = '', filter: any = {}, responseProfile: any = {}, pageSize: number = 30, pageIndex: number = 1): VidiunRequest<any> {

    const parameters :any = {
      pager: {
        objectType: "VidiunFilterPager",
        pageSize: pageSize,
        pageIndex: pageIndex
      },
      responseProfile: Object.assign({}, responseProfile),
      filter: Object.assign({}, filter)
    };

    if (search.length){
      Object.assign(parameters.filter, {freeText: search});
    }

    return new VidiunRequest<any>('liveStream', 'list', parameters);
  }

  static update(entryId: string, liveStreamEntry: any = {}) : VidiunRequest<any> {

    const parameters :any = {
      entryId: entryId,
    };

    Object.assign(parameters, liveStreamEntry);


    return new VidiunRequest<any>('liveStream', 'update', parameters);
  }

}
