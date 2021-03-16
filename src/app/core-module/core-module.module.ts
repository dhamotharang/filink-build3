import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {NoopInterceptor} from './interceptor/noop-interceptor';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {FacilityService, MapService, StatisticalForCommonService, SystemForCommonService} from './api-service';
import {LockService} from './api-service/lock';
import {RoleDeactivateGuardService} from './guard-service/role-deactivate-guard.service';
import {AlarmStoreService} from './store/alarm.store.service';
import {DownloadService} from './api-service/download';
import {MapScreenService} from './api-service/screen-map';
import {SmartService} from './api-service/facility/smart/smart.service';
import {DeviceStatisticalService} from './api-service/statistical/device-statistical';
import {TopNService} from './api-service/statistical/top-n';
import {OdnDeviceService} from './api-service/statistical/odn-device';
import {TroubleUtil} from './business-util/trouble/trouble-util';
import {AlarmForCommonService} from './api-service/alarm';
import {FacilityForCommonService} from './api-service/facility';
import {TroubleForCommonService} from './api-service/trouble';
import {WorkOrderForCommonService} from './api-service/work-order';
import {UserForCommonService} from './api-service/user';
import {ApplicationSystemForCommonService} from './api-service/application-system';
import {ProductForCommonService} from './api-service/product/product-for-common.service';
import {WebUploaderRequestService} from './api-service/web-uploader';
import {SupplierForCommonService} from './api-service/supplier/supplier-for-common.service';

const SERVICE_PROVIDERS = [
  {provide: AlarmStoreService, useClass: AlarmStoreService},
  {provide: FacilityService, useClass: FacilityService},
  {provide: TroubleForCommonService, useClass: TroubleForCommonService},
  {provide: MapService, useClass: MapService},
  {provide: LockService, useClass: LockService},
  {provide: DownloadService, useClass: DownloadService},
  {provide: DeviceStatisticalService, useClass: DeviceStatisticalService},
  {provide: TopNService, useClass: TopNService},
  {provide: OdnDeviceService, useClass: OdnDeviceService},
  {provide: FacilityForCommonService, useClass: FacilityForCommonService},
  {provide: WorkOrderForCommonService, useClass: WorkOrderForCommonService},
  {provide: ProductForCommonService, useClass: ProductForCommonService},
  {provide: WebUploaderRequestService, useClass: WebUploaderRequestService},
  {provide: SupplierForCommonService, useClass: SupplierForCommonService},
  RoleDeactivateGuardService,
  MapScreenService,
  SmartService,
  AlarmForCommonService,
  UserForCommonService,
  SystemForCommonService,
  ApplicationSystemForCommonService,
  StatisticalForCommonService
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [ReactiveFormsModule],
  providers: [TroubleUtil,
    {provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true},
    ...SERVICE_PROVIDERS
  ]
})
export class CoreModule {
}
