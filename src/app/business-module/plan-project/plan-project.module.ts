import {SharedModule} from '../../shared-module/shared-module.module';
import {CoreModule} from '../../core-module/core-module.module';
import {ROUTER_CONFIG} from './plan-project.routes';
import {RouterModule} from '@angular/router';
import {PlanProjectComponent} from './plan-project.component';
import {NgModule} from '@angular/core';
import {ProjectListComponent} from './project-manage/project-list/project-list.component';
import {PlanDetailComponent} from './plan-manage/plan-detail/plan-detail.component';
import {PlanListComponent} from './plan-manage/plan-list/plan-list.component';
import {PlanWisdomListComponent} from './plan-manage/plan-wisdom-list/plan-wisdom-list.component';
import {PlanWisdomDetailComponent} from './plan-manage/plan-wisdom-detail/plan-wisdom-detail.component';
import {ProjectWisdomListComponent} from './project-manage/project-wisdom-list/project-wisdom-list.component';
import {ProjectBasicInfoComponent} from './project-manage/project-detail/project-basic-info/project-basic-info.component';
import {PlanPointDetailComponent} from './plan-manage/plan-point-detail/plan-point-detail.component';
import {PlanningPointComponent} from './project-manage/project-detail/planning-point/planning-point.component';
import {PlanApiService} from './share/service/plan-api.service';
import {PlanProjectApiService} from './share/service/plan-project.service';
import { ProjectWisdomDetailComponent } from './project-manage/project-wisdom-detail/project-wisdom-detail.component';
import { ProductListSelectorComponent } from './components/product-list-selector/product-list-selector.component';
import { ChangePointModelComponent } from './project-manage/project-detail/change-point-model/change-point-model.component';

@NgModule({
  declarations: [PlanProjectComponent, PlanListComponent, PlanDetailComponent, ProjectListComponent, PlanWisdomListComponent, PlanWisdomDetailComponent,
    ProjectWisdomListComponent,
    ProjectBasicInfoComponent,
    PlanPointDetailComponent,
    PlanningPointComponent,
    ProjectWisdomDetailComponent,
    ProductListSelectorComponent,
    ChangePointModelComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(ROUTER_CONFIG),
    CoreModule
  ],
  exports: [],
  providers: [ PlanApiService,  PlanProjectApiService]
})
export class PlanProjectModule {
}
