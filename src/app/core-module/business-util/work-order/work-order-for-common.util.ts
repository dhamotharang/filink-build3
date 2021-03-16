import {WorkOrderStatusClassEnum} from '../../enum/work-order/work-order-status-class.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {CommonUtil} from '../../../shared-module/util/common-util';
import {LanguageEnum} from '../../../shared-module/enum/language.enum';
import {WorkOrderStatusEnum} from '../../enum/work-order/work-order-status.enum';
import {WorkOrderTypesEnum} from '../../enum/work-order/work-order-type.enum';

/**
 * 工单状态图标及国际化
 */
export class WorkOrderStatusUtil {
  /**
   * 获取工单图标
   * param {string} type
   * returns {string}
   */
  public static getWorkOrderIconClassName(type: string): string {
    let iconClass = '';
    if (type) {
      for (const k in WorkOrderStatusClassEnum) {
        if (WorkOrderStatusClassEnum[k] && k === type) {
          iconClass = `iconfont icon-fiLink ${WorkOrderStatusClassEnum[k]}`;
          break;
        }
      }
    }
    return iconClass;
  }

  /**
   * 获取状态名称
   */
  public static getWorkOrderStatus(i18n: NzI18nService, code = null) {
    return CommonUtil.codeTranslate(WorkOrderStatusEnum, i18n, code, LanguageEnum.workOrder);
  }

  /**
   * 获取工单状态列表
   */
  public static getWorkOrderStatusList(i18n: NzI18nService) {
    const list = [];
    for (const key in WorkOrderStatusEnum) {
      if (WorkOrderStatusEnum[key]) {
        const label = WorkOrderStatusUtil.getWorkOrderStatus(i18n, WorkOrderStatusEnum[key]);
        if (label) {
          list.push({
            value: WorkOrderStatusEnum[key],
            label: label
          });
        }
      }
    }
    return list;
  }

  /**
   * 获取工单类型
   */
  public static getWorkOrderType(i18n: NzI18nService, code = null) {
    return CommonUtil.codeTranslate(WorkOrderTypesEnum, i18n, code, LanguageEnum.inspection);
  }
}
