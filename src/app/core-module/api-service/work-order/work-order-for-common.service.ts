import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {WorkOrderUrl} from './work-order-request-url';
import {ResultModel} from '../../../shared-module/model/result.model';
import {QueryConditionModel} from '../../../shared-module/model/query-condition.model';
import {InspectionWorkOrderModel} from '../../model/work-order/inspection-work-order.model';
import {ClearBarrierWorkOrderModel} from '../../model/work-order/clear-barrier-work-order.model';
import {DepartmentUnitModel} from '../../model/work-order/department-unit.model';
import {UserRoleModel} from '../../model/user/user-role.model';

/**
 * 工单对外公共接口
 */
@Injectable()
export class WorkOrderForCommonService {
  constructor(private $http: HttpClient) {}

  // 告警转工单责任单位查询
  alarmQueryResponsibilityUnit(body: string[]): Observable<ResultModel<DepartmentUnitModel[]>> {
    return this.$http.post<ResultModel<DepartmentUnitModel[]>>(`${WorkOrderUrl.alarmQueryResponsibilityUnit}`, body);
  }

  // 查询责任单位下是否有工单
  existsWorkOrderForDeptIds(body): Observable<Object> {
    return this.$http.post(`${WorkOrderUrl.existsWorkOrderForDeptIds}`, body);
  }

  // 查询巡检工单
  queryInspectionList(body: QueryConditionModel): Observable<ResultModel<InspectionWorkOrderModel[]>> {
    return this.$http.post<ResultModel<InspectionWorkOrderModel[]>>(WorkOrderUrl.queryInspectionList, body);
  }

  // 新增
  addWorkOrder(body: ClearBarrierWorkOrderModel): Observable<ResultModel<string>> {
    return this.$http.post<ResultModel<string>>(`${WorkOrderUrl.addClearBarrierWorkOrder}`, body);
  }

  // 销账工单名称唯一性校验
  checkClearName(name: string, id: string): Observable<ResultModel<string>> {
    return this.$http.post<ResultModel<string>>(`${WorkOrderUrl.checkClearName}`, {title: name, procId: id});
  }

  // 查询消障工单
  queryClearList(body: QueryConditionModel): Observable<ResultModel<ClearBarrierWorkOrderModel[]>> {
    return this.$http.post<ResultModel<ClearBarrierWorkOrderModel[]>>(WorkOrderUrl.queryClearList, body);
  }
  // 查询所有角色
  queryUserRoles(): Observable<ResultModel<UserRoleModel[]>> {
    return this.$http.post<ResultModel<UserRoleModel[]>>(WorkOrderUrl.queryUserAllRoles, {});
  }
  // 获取当前单位下责任人
  getDepartUserList(body: QueryConditionModel): Observable<ResultModel<UserRoleModel[]>> {
    return this.$http.post<ResultModel<UserRoleModel[]>>(WorkOrderUrl.getUserListByDepart, body);
  }
}
