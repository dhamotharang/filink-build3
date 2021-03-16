import {Routes} from '@angular/router';
import {PlanProjectComponent} from './plan-project.component';
import {PlanListComponent} from './plan-manage/plan-list/plan-list.component';
import {PlanDetailComponent} from './plan-manage/plan-detail/plan-detail.component';
import {PlanWisdomListComponent} from './plan-manage/plan-wisdom-list/plan-wisdom-list.component';
import {PlanWisdomDetailComponent} from './plan-manage/plan-wisdom-detail/plan-wisdom-detail.component';
import {ProjectListComponent} from './project-manage/project-list/project-list.component';
import {ProjectBasicInfoComponent} from './project-manage/project-detail/project-basic-info/project-basic-info.component';
import {PlanningPointComponent} from './project-manage/project-detail/planning-point/planning-point.component';
import {ProjectWisdomListComponent} from './project-manage/project-wisdom-list/project-wisdom-list.component';
import {ProjectWisdomDetailComponent} from './project-manage/project-wisdom-detail/project-wisdom-detail.component';
import {PlanPointDetailComponent} from './plan-manage/plan-point-detail/plan-point-detail.component';

export const ROUTER_CONFIG: Routes = [
  {
    path: '',
    component: PlanProjectComponent,
    children: [
      { // 规划列表
        path: 'plan-list',
        component: PlanListComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'planManage'}, {label: 'planList'}]
        }
      },
      { // 规划详情
        path: 'plan-detail/:type',
        component: PlanDetailComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'planManage'}, {label: 'planList', url: 'plan-list'}, {label: 'plan'}]
        }
      },
      { // 规划点位详情
        path: 'plan-point-detail/:type',
        component: PlanPointDetailComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'planManage'}, {label: 'planList', url: 'plan-list'}, {label: 'planPoint'}]
        }
      },
      { // 智慧杆列表
        path: 'plan-wisdom-list',
        component: PlanWisdomListComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'planManage'}, {label: 'planWisdomList'}]
        }
      },
      { // 智慧杆详情
        path: 'plan-wisdom-detail/:type',
        component: PlanWisdomDetailComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'planManage'}, {label: 'planWisdomList', url: 'plan-wisdom-list'}, {label: 'planWisdom'}]
        }
      },
      { // 项目列表
        path: 'project-list',
        component: ProjectListComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'projectManage'}, {label: 'projectList'}]
        }
      },
      { // 项目详情
        path: 'project-detail/:type',
        component: ProjectBasicInfoComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'projectManage'}, {label: 'projectList', url: 'project-list'}, {label: 'project'}]
        }
      },
      { // 项目规划点位
        path: 'point-detail',
        component: PlanningPointComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'projectManage'}, {label: 'projectList', url: 'project-list'}, {label: 'projectPoint'}]
        }
      },
      { // 项目智慧杆列表
        path: 'project-wisdom-list',
        component: ProjectWisdomListComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'projectManage'}, {label: 'projectWisdomList'}]
        }
      },
      { // 项目智慧杆编辑
        path: 'project-wisdom-detail/:type',
        component: ProjectWisdomDetailComponent,
        data: {
          breadcrumb: [{label: 'planProject'}, {label: 'projectManage'}, {label: 'projectWisdomList'}]
        }
      },
    ]
  }
];
