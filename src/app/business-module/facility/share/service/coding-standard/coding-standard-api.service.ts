import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {CodingStandardServiceUrlConst} from '../../const/coding-standard-service-url.const';
import {ControlModel} from '../../../../../core-module/model/facility/control.model';
import {LOCK_URL} from '../../../../../core-module/api-service/lock/lock-request-url';
/**
 * 编码标准接口service
 */
@Injectable()
export class CodingStandardApiService {
  constructor(private $http: HttpClient) {
  }

  /**
   * 查询编码标准列表
   */
  public codingRuleListByPage(body): Observable<ResultModel<any>> {
    return this.$http.post<ResultModel<any>>(CodingStandardServiceUrlConst.codingRuleListByPage, body);
  }

  /**
   * 查询可选字段
   */
  public queryCodingRuleField(): Observable<ResultModel<any>> {
    return this.$http.get<ResultModel<any>>(`${CodingStandardServiceUrlConst.queryCodingRuleField}`);
  }

  /**
   * 启用编码标准
   */
  public enableCodingRule(body): Observable<ResultModel<any>> {
    return this.$http.post<ResultModel<any>>(CodingStandardServiceUrlConst.enableCodingRule, body);
  }

  /**
   * 禁用编码标准
   */
  public disableCodingRule(body): Observable<ResultModel<any>> {
    return this.$http.post<ResultModel<any>>(CodingStandardServiceUrlConst.disableCodingRule, body);
  }

  /**
   * 删除编码标准
   */
  public deleteCodingRule(body): Observable<ResultModel<any>> {
    return this.$http.post<ResultModel<any>>(CodingStandardServiceUrlConst.deleteCodingRule, body);
  }
}
