import { Injectable } from '@angular/core';

import {VidiunRequest} from "../vidiun-request";

@Injectable()
export class LiveAnalyticsService {

  constructor(){
  }

  static getEvents(reportType: string ='', filter: any = {}, responseProfile: any = {}, pageSize: number = 30, pageIndex: number = 1): VidiunRequest<any> {

    const parameters :any = {
      pager: {
        objectType: "VidiunFilterPager",
        pageSize: pageSize,
        pageIndex: pageIndex
      },
      responseProfile: Object.assign({}, responseProfile),
      filter: Object.assign({'objectType':'VidiunLiveReportInputFilter'}, filter),
      action: 'getEvents',
      reportType: reportType
    };

    return new VidiunRequest<any>('liveReports', 'getEvents', parameters);
  }

}
