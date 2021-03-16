import {SelectModel} from '../../../shared-module/model/select.model';
import {ResultModel} from '../../../shared-module/model/result.model';
import {AlarmForCommonService} from '../../api-service/alarm/alarm-for-common.service';
import { NzI18nService } from 'ng-zorro-antd';
import { CommonUtil } from '../../../shared-module/util/common-util';
import { AlarmCleanStatusEnum } from '../../enum/alarm/alarm-clean-status.enum';
import { AlarmLevelEnum } from '../../enum/alarm/alarm-level.enum';
import { AlarmConfirmStatusEnum } from '../../enum/alarm/alarm-confirm-status.enum';

export class AlarmForCommonUtil {
  /**
   * 页面展示告警类别信息
   */
  public static showAlarmTypeInfo(alarmList: SelectModel[], type: string): string {
    let alarmTypeName = '';
    alarmList.forEach(entity => {
      if (entity.value === type) {
        alarmTypeName = entity.label;
      }
    });
    return alarmTypeName;
  }

  /**
   * 动态设置频次字体大小
   */
  public static setFontSize(len: string | number) {
    const countLength = String(len).length;
    let fontSize = 0;
    if (countLength > 4) {
      fontSize = 16;
    } else if (countLength > 2) {
      fontSize = 22;
    } else {
      fontSize = 28;
    }
    return fontSize;
  }

  /**
   * 告警类别
   */
  public static getAlarmTypeList(alarmService: AlarmForCommonService) {
    return new Promise((resolve, reject) => {
      alarmService.getAlarmTypeList().subscribe((res: ResultModel<SelectModel[]>) => {
        if (res.code === 0) {
          const data = res.data;
          const alarmList = data.map(item => {
            return ({'label': item.value, 'value': item.key, 'code': item.key});
          });
          resolve(alarmList);
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * 获取清除状态
   */
  public static translateAlarmCleanStatus(i18n: NzI18nService, code = null) {
    return CommonUtil.codeTranslate(AlarmCleanStatusEnum, i18n, code);
  }

  /**
   * 获取告警等级
   */
  public static translateAlarmLevel(i18n: NzI18nService, code = null): any {
    return CommonUtil.codeTranslate(AlarmLevelEnum, i18n, code, 'alarm');
  }

  /**
   * 获取告警确认状态
   */
  public static translateAlarmConfirmStatus(i18n: NzI18nService, code = null): any {
    return CommonUtil.codeTranslate(AlarmConfirmStatusEnum, i18n, code);
  }
}
