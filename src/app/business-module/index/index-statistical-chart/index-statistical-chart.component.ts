import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {NzI18nService, NzModalService} from 'ng-zorro-antd';
import {MapService} from '../../../core-module/api-service/index/map';
import {FiLinkModalService} from '../../../shared-module/service/filink-modal/filink-modal.service';
import {IndexLanguageInterface} from '../../../../assets/i18n/index/index.language.interface';
import {LockService} from '../../../core-module/api-service/lock';
import {FacilityService} from '../../../core-module/api-service/facility/facility-manage';
import {CommonUtil} from '../../../shared-module/util/common-util';
import {INDEX_CARD_TYPE} from '../../../core-module/const/index/index.const';
import {indexChart} from '../util/index-charts';
import {AlarmLevelColorEnum} from '../../../core-module/enum/alarm/alarm-level-color.enum';
import {DeviceStatusEnum} from '../../../core-module/enum/facility/facility.enum';
import {LanguageEnum} from '../../../shared-module/enum/language.enum';
import {ResultModel} from '../../../shared-module/model/result.model';
import {FacilityForCommonUtil} from '../../../core-module/business-util/facility/facility-for-common.util';
import {AlarmLevelCountEnum} from '../../../core-module/enum/alarm/alarm-level-count.enum';
import {DeviceTypeCountModel} from '../../../core-module/model/facility/device-type-count.model';
import {AlarmLevelStatisticsModel} from '../../../core-module/model/alarm/alarm-level-statistics.model';
import {AlarmStatisticsGroupInfoModel} from '../../../core-module/model/alarm/alarm-statistics-group-Info.model';
import {FacilityLogTopNumModel} from '../../../core-module/model/facility/facility-log-top-num.model';
import {FacilityDetailInfoModel} from '../../../core-module/model/facility/facility-detail-info.model';
import {ResultCodeEnum} from '../../../shared-module/enum/result-code.enum';
import {ApplicationSystemForCommonService} from '../../../core-module/api-service/application-system';
import {WorkOrderIncreaseModel} from '../../../core-module/model/application-system/work-order-increase.model';
import {QueryFacilityCountModel} from '../shared/model/query-facility-count.model';
import {SessionUtil} from '../../../shared-module/util/session-util';

@Component({
  selector: 'app-index-statistics',
  templateUrl: './index-statistical-chart.component.html',
  styleUrls: ['./index-statistical-chart.component.scss']
})
export class IndexStatisticalChartComponent implements OnInit, AfterViewInit {

  // 标题
  @Input() title: string;
  // 类型
  @Input() type: number;
  // 区域信息
  @Input() data: any[];
  // 国际化
  public indexLanguage: IndexLanguageInterface;
  // 卡片类型
  public cardType = INDEX_CARD_TYPE;
  // 统计不同类型总数
  public statisticsCount: QueryFacilityCountModel[] = [];
  // 统计设施总数
  public statisticsNumber = [0, 0, 0, 0, 0, 0];
  // 是否显示设施状态图实例
  public deviceStatusChartOption: any = {};
  // 设施状态
  public noDeviceStatusChart = true;
  // 工单增量图实例
  public procAddListCountOption: any = {};
  // 是否显示工单增量
  public noProcAddListCount = true;
  // 查询繁忙TOP图实例
  public userUnlockingTopOption: any = {};
  // 是否显示查询繁忙TOP图
  public noUserUnlockingTop = true;
  // 告警设施Top10图实例
  public screenDeviceIdsGroupOption: any = {};
  // 测试统计图
  public ceshiOption: any = {};
  // 是否显示告警设施Top10图
  public noScreenDeviceIdsGroup = true;
  // 是否显示ceshi图
  public noScreenCeShi = true;
  // 当前告警各级别数量图实例
  public alarmCurrentLevelGroupOption: any = {};
  // 是否显示当前告警各级别数量
  public noAlarmCurrentLevelGroup = true;
  // 告警增量图实例
  public alarmDateStatisticsOption: any = {};
  // 是否显示告警增量
  public noAlarmDateStatistics = true;
  // 设施集权限
  public deviceRole: string[] = [];
  // 设施总数/不同类型的设施总数
  public deviceCount: boolean = false;
  // 设施状态
  public deviceStatus: boolean = false;
  // 当前告警总数
  public alarmCount: boolean = false;
  // 告警增量
  public alarmIncrement: boolean = false;
  // 工单增量
  public workIncrement: boolean = false;
  // 繁忙设施TOP/告警设施TOP
  public topRole: boolean = false;

  constructor(private $nzI18n: NzI18nService,
              private $message: FiLinkModalService,
              private $mapService: MapService,
              private $modal: NzModalService,
              private $lockService: LockService,
              private $facilityService: FacilityService,
              private $applicationSystemForCommonService: ApplicationSystemForCommonService,
  ) {
  }

  ngOnInit() {
    // 国际化配置
    this.indexLanguage = this.$nzI18n.getLocaleData(LanguageEnum.index);
    // 统计卡片权限查询
    this.queryDeviceRole();
  }

  ngAfterViewInit() {
    // 初始化统计图
    this.initCountChart();
  }

  /**
   * 权限查询
   */
  queryDeviceRole() {
    const userInfo = SessionUtil.getUserInfo();
    this.deviceRole = userInfo.role.roleDeviceTypeDto.deviceTypes;
  }

  /**
   * 初始化统计图
   */
  private initCountChart(): void {
    switch (this.type) {
      // 设施总数
      case this.cardType.deviceCount:
        this.queryDeviceTypeALLCount();
        break;
      // 类型总数
      case this.cardType.typeCount:
        this.queryDeviceTypeCount();
        break;
      // 设施状态
      case this.cardType.deviceStatus:
        this.queryUserDeviceStatusCount();
        break;
      // 当前告警总数
      case this.cardType.alarmCount:
        this.queryAlarmCurrentLevelGroup();
        break;
      // 告警增量
      case this.cardType.alarmIncrement:
        this.queryAlarmDateStatistics();
        break;
      // 工单增量
      case this.cardType.workIncrement:
        this.queryHomeProcAddListCountGroupByDay();
        break;
      // 繁忙设施TOP
      case this.cardType.busyTop:
        this.queryUserUnlockingTopNum();
        break;
      // 告警设施TOP
      case this.cardType.alarmTop:
        this.queryScreenDeviceIdsGroup();
        break;
      // ceshi
      case this.cardType.ceshi:
        this.queryCeShi();
        break;
    }
  }

  /**
   * 查询设施总数
   */
  private queryDeviceTypeALLCount(): void {
    this.$facilityService.queryDeviceTypeCount().subscribe((result: ResultModel<Array<DeviceTypeCountModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<DeviceTypeCountModel> = [];
        // 根据权限集进行过滤
        result.data.forEach(item => {
          const role = this.deviceRole.indexOf(item.deviceType);
          if (role !== -1) {
            data.push(item);
          }
        });
        // 设施总数
        let sum = 0;
        data.forEach(item => {
          sum += item.deviceNum;
        });
        // 补零
        const count = (Array('000000').join('0') + sum).slice(-6);
        this.statisticsNumber = [];
        // 统计设施总数
        this.statisticsNumber = (count + '').split('').map(Number);
      }
    });
  }

  /**
   * 查询类型总数
   */
  private queryDeviceTypeCount(): void {
    this.$facilityService.queryDeviceTypeCount().subscribe((result: ResultModel<Array<DeviceTypeCountModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<DeviceTypeCountModel> = result.data || [];
        // 获取全部设施类型
        const deviceTypes = FacilityForCommonUtil.translateDeviceType(this.$nzI18n) as QueryFacilityCountModel[];
        // 根据权限集进行过滤
        const deviceList: QueryFacilityCountModel[] = [];
        deviceTypes.forEach(item => {
          const role = this.deviceRole.indexOf(item.code);
          if (role !== -1) {
            deviceList.push(item);
          }
        });
        // 构造设施数据
        deviceList.forEach(item => {
          const type = data.find(_item => _item.deviceType === item.code);
          if (type) {
            item.sum = type.deviceNum;
          } else {
            item.sum = 0;
          }
          item.textClass = CommonUtil.getFacilityTextColor(item.code);
          item.iconClass = CommonUtil.getFacilityIConClass(item.code);
        });
        // 统计不同类型总数
        this.statisticsCount = deviceList;
      }
    });
  }

  /**
   * 查询各设施状态数量
   */
  private queryUserDeviceStatusCount(): void {
    this.$mapService.queryUserDeviceStatusCount().subscribe((result: ResultModel<Array<DeviceTypeCountModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<DeviceTypeCountModel> = result.data || [];
        if (data.length === 0) {
          this.noDeviceStatusChart = true;
        } else {
          this.noDeviceStatusChart = false;
          const userDeviceStatusCount = data.map(_item => {
            if (_item.deviceNum !== 0) {
              return {
                value: _item.deviceNum,
                name: CommonUtil.codeTranslate(DeviceStatusEnum, this.$nzI18n, _item.deviceStatus, LanguageEnum.index) || '',
                itemStyle: {color: CommonUtil.getFacilityColor(_item.deviceStatus)}
              };
            }
          });
          this.deviceStatusChartOption = indexChart.setRingChartOption(userDeviceStatusCount, this.indexLanguage.facilityStatusTitle);
        }
      }
    });
  }

  /**
   * 获取当前告警总数
   */
  private queryAlarmCurrentLevelGroup(): void {
    this.$mapService.queryAlarmCurrentLevelGroup().subscribe((result: ResultModel<Array<AlarmLevelStatisticsModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        if (result.data.length === 0) {
          this.noAlarmCurrentLevelGroup = true;
        } else {
          const data: Array<AlarmLevelStatisticsModel> = result.data || [];
          // 获取全部的告警级别
          const alarmCount = CommonUtil.codeTranslate(AlarmLevelCountEnum, this.$nzI18n, null, LanguageEnum.bigScreen);
          let sum = 0;
          Object.keys(data).forEach(item => {
            const alarmItem = alarmCount[Object.keys(data).indexOf(item)];
            if (item === alarmItem['code']) {
              sum += data[item];
              if (data[item] !== 0) {
                alarmItem['value'] = data[item];
                alarmItem['name'] = alarmItem['label'];
                alarmItem['itemStyle'] = {color: AlarmLevelColorEnum[item.replace('Count', '')]};
              }
            }
          });
          // 如果告警总数大于零
          if (sum > 0) {
            this.noAlarmCurrentLevelGroup = false;
          }
          this.alarmCurrentLevelGroupOption = indexChart.setBarChartOption(alarmCount, this.indexLanguage.currentAlarmNum);
        }
      }
    });
  }

  /**
   * 工单增量
   */
  private queryHomeProcAddListCountGroupByDay(): void {
    // 固定参数
    const params = {
      statisticalType: '4'
    };
    this.$applicationSystemForCommonService.findApplyStatisticsByCondition(params).subscribe((result: ResultModel<WorkOrderIncreaseModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        if (result.data.length === 0) {
          this.noProcAddListCount = true;
        } else {
          this.noProcAddListCount = false;
          const time = result.data.map(item => item.formatDate);
          const count = result.data.map(item => item.count);
          const lineData = [
            {data: count, type: 'line', name: this.indexLanguage.clearBarrierWorkOrder},
          ];
          this.procAddListCountOption = indexChart.setLineChartOption(lineData, time);
        }
      }
    });
  }

  /**
   * 告警增量
   */
  private queryAlarmDateStatistics(): void {
    // 固定参数
    const params: string = 'DAY';
    this.$mapService.queryAlarmDateStatistics(params, '').subscribe((result: ResultModel<Array<AlarmStatisticsGroupInfoModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<AlarmStatisticsGroupInfoModel> = result.data || [];
        if (data.length === 0) {
          this.noAlarmDateStatistics = true;
        } else {
          this.noAlarmDateStatistics = false;
          const time = data.map(item => item.groupLevel);
          const count = data.map(item => item.groupNum);
          const lineData = [
            {data: count, type: 'line', name: this.indexLanguage.alarmIncrement},
          ];
          this.alarmDateStatisticsOption = indexChart.setLineChartOption(lineData, time);
        }
      }
    });
  }

  /**
   * 查询告警设施Top10
   */
  private queryScreenDeviceIdsGroup(): void {
    this.$mapService.queryScreenDeviceIdsGroup().subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        if (result.data.length === 0) {
          this.noScreenDeviceIdsGroup = true;
        } else {
          // 告警设施
          const deviceIds = result.data.map(_item => {
            return _item.alarmSource;
          });
          // 根据设备id加设备名称
          this.$mapService.queryDeviceByIds(deviceIds).subscribe((getResult: ResultModel<Array<FacilityDetailInfoModel>>) => {
            const deviceData: Array<FacilityDetailInfoModel> = getResult.data || [];
            if (getResult.code === 0 && deviceData.length > 0) {
              this.noScreenDeviceIdsGroup = false;
              // 告警设施
              const screenDeviceIdsGroupNum = result.data.map(_item => {
                return {
                  value: _item.count,
                  name: this.getAlarmIdFromName(_item.alarmSource, deviceData),
                };
              });
              // 告警名称
              const screenDeviceIdsGroupName = result.data.map(_item => {
                return this.getAlarmIdFromName(_item.alarmSource, deviceData);
              });
              this.screenDeviceIdsGroupOption = indexChart.setHistogramChartOption(screenDeviceIdsGroupNum, screenDeviceIdsGroupName);
            }
          });

        }
      }
    });
  }

  /**
   * 查询繁忙TOP
   */
  private queryUserUnlockingTopNum(): void {
    this.$mapService.queryUserUnlockingTopNum().subscribe((result: ResultModel<Array<FacilityLogTopNumModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<FacilityLogTopNumModel> = result.data || [];
        if (data.length === 0) {
          this.noUserUnlockingTop = true;
        } else {
          this.noUserUnlockingTop = false;
          const userUnlockingTopNum = data.map(_item => {
            return {
              value: _item.countValue,
              name: _item.deviceName,
            };
          });
          const userUnlockingTopName = data.map(item => item.deviceName);
          this.userUnlockingTopOption = indexChart.setHistogramChartOption(userUnlockingTopNum, userUnlockingTopName);
        }
      }
    });
  }

  /**
   * 首页根据设施id和缓存data查询设施名称
   */
  private getAlarmIdFromName(id: string, data: any): string {
    let alarmName = '';
    data.filter(item => {
      if (item.deviceId === id) {
        alarmName = item.deviceName;
      }
    });
    return alarmName;
  }

  queryCeShi() {
    // this.noScreenCeShi = this.noScreenCeShi;
    const newlineData = [{value: 1048, name: '搜索引擎'},
      {value: 735, name: '直接访问'},
      {value: 580, name: '邮件营销'},
      {value: 484, name: '联盟广告'},
      {value: 300, name: '视频广告'}];
    const newTime = 'ceshi';
    this.ceshiOption = indexChart.setNewBarChartOption(newlineData, newTime);
  }
}
