import { Injectable } from '@angular/core';
import { ApplicationMode } from "../types/live-dashboard.types";

@Injectable()
export class LiveDashboardConfiguration {
  public ks: string;
  public service_url: string;
  public entryId: string;
  public uiConfId: string;
  public lang: string;
  public version: string;
  public mode: ApplicationMode;
}
