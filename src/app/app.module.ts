import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from "ng2-translate";
import { TooltipModule } from '@vidiun-ng/vidiun-ui';

// PrimeNG
import { TabMenuModule, TabViewModule, InputTextModule, InputTextareaModule, ButtonModule, DropdownModule, CheckboxModule, RadioButtonModule, GrowlModule, ConfirmDialogModule } from 'primeng/primeng';

// Services
import { LiveEntryService } from './services/live-entry.service';
import { PartnerInformationService } from "./services/partner-information.service";
import { LiveEntryTimerTaskService } from "./services/entry-timer-task.service";
import { BootstrapService } from "./bootstrap.service";
import { ConfirmationService } from "primeng/primeng"

// Components
import { AppComponent } from './app.component';
import { DefaultDashboardComponent } from './default-dashboard/default-dashboard.component';
import { CompactDashboardComponent } from './compact-dashboard/compact-dashboard.component';
import { DetailAndPreviewComponent } from './details-and-preview/details-and-preview.component';
import { StreamInfoComponent } from './stream-info/stream-info.component';
import { EncoderSettingsComponent } from './stream-info/encoder-settings/encoder-settings.component';
import { BasicSettingsComponent } from './stream-info/basic-settings/basic-settings.component';
import { AdditionalSettingsComponent } from './stream-info/additional-settings/additional-settings.component';
import { StreamConfigurationsComponent } from './components/stream-configurations/stream-configurations.component';
import { AreaBlockerComponent } from "@kaltura-ng/kaltura-ui/area-blocker";
import { StreamHealthNotificationsComponent } from './stream-info/stream-health-notifications/stream-health-notifications.component';
import { FurtherInformationComponent } from './components/further-information/further-information.component';
// TODO: Remove!!!
import { VidiunPlayerComponent } from './player/player.component';

// Pipes
import { RecordingTypePipe } from './pipes/recording-type.pipe';
import { ModerationPipe } from './pipes/moderation.pipe';
import { EntryTypePipe } from './pipes/entry-type.pipe';
import { EntryBooleanConfigurationPipe } from './pipes/entry-boolean-configuration.pipe';
import { EntryDynamicInformationPipe } from './pipes/entry-dynamic-information.pipe';
import { TranscodingInfoPipe } from './pipes/transcoding-info.pipe';
import { SafePipe } from "@vidiun-ng/vidiun-ui/safe.pipe";
import { DurationPipe } from "./pipes/duration.pipe";
import { LocaleTimePipe } from "./pipes/locale-time.pipe";
import { SeverityToHealthPipe } from './pipes/severity-to-health.pipe';
import { CodeToSeverityPipe } from './pipes/code-to-severity.pipe';
import { StreamStatusPipe } from './pipes/stream-status.pipe';

// Configuration Services
import { LiveDashboardConfiguration } from "./services/live-dashboard-configuration.service";
import { AppLocalization, AppStorage } from "@kaltura-ng/kaltura-common";
import { KalturaClientModule } from 'kaltura-ngx-client';

@NgModule({
  declarations: [
    AppComponent,
    StreamInfoComponent,
    EncoderSettingsComponent,
    BasicSettingsComponent,
    AdditionalSettingsComponent,
    DetailAndPreviewComponent,
    StreamConfigurationsComponent,
    RecordingTypePipe,
    ModerationPipe,
    EntryTypePipe,
    EntryBooleanConfigurationPipe,
    EntryDynamicInformationPipe,
    TranscodingInfoPipe,
    SafePipe,
    DurationPipe,
    StreamHealthNotificationsComponent,
    LocaleTimePipe,
    AreaBlockerComponent,
    SeverityToHealthPipe,
    CodeToSeverityPipe,
    StreamStatusPipe,
    FurtherInformationComponent,
    KalturaPlayerComponent,
    DefaultDashboardComponent,
    CompactDashboardComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    TranslateModule.forRoot(),
    FormsModule,
    BrowserAnimationsModule,
    TabMenuModule,
    TabViewModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    DropdownModule,
    CheckboxModule,
    RadioButtonModule,
    GrowlModule,
    TooltipModule,
    ConfirmDialogModule,
    KalturaClientModule.forRoot()
  ],
  providers: [
    LiveEntryService,
    PartnerInformationService,
    LiveEntryTimerTaskService,
    BootstrapService,
    LiveDashboardConfiguration,
    CodeToSeverityPipe,
    StreamStatusPipe,
    AppLocalization,
    AppStorage,
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private _bootstrapService: BootstrapService) {
    // TODO: Handle a case where initialization has failed!!!
  }
}
