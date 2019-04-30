import { Injectable } from '@angular/core';

import {VidiunRequest} from "../vidiun-request";

@Injectable()
export class BaseEntryService {

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

        return new VidiunRequest<any>('baseEntry', 'list', parameters);
    }

}
