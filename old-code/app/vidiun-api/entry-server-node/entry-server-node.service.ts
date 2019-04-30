import { Injectable } from '@angular/core';

import {VidiunRequest} from "../vidiun-request";

@Injectable()
export class EntryServerNodeService {

  constructor(){
  }

  static list(filter: any = {}, responseProfile: any = {}, pageSize: number = 30, pageIndex: number = 1): VidiunRequest<any> {

    const parameters :any = {
      pager: {
        objectType: "VidiunFilterPager",
        pageSize: pageSize,
        pageIndex: pageIndex
      },
      responseProfile: Object.assign({}, responseProfile),
      filter: Object.assign({'objectType':'VidiunLiveEntryServerNodeFilter'}, filter)
    };

    return new VidiunRequest<any>('entryServerNode', 'list', parameters);
  }

}
