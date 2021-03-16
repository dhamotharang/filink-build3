import {Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NzI18nService} from 'ng-zorro-antd';
import * as _ from 'lodash';
import {WorkOrderForCommonService} from '../../../../core-module/api-service/work-order';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {ColumnConfig, TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {FacilityLanguageInterface} from 'src/assets/i18n/facility/facility.language.interface';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {WorkOrderLanguageInterface} from '../../../../../assets/i18n/work-order/work-order.language.interface';
import {FilterCondition, QueryConditionModel} from '../../../../shared-module/model/query-condition.model';
import {ObjectTypeEnum} from 'src/app/core-module/enum/facility/object-type.enum';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {PageSizeEnum} from '../../../../shared-module/enum/page-size.enum';
import {WorkOrderResourceEnum, WorkOrderStatusEnum} from '../../../../core-module/enum/work-order/work-order.enum';
import {WorkOrderStatusUtil} from '../../../../core-module/business-util/work-order/work-order-for-common.util';
import {InspectionWorkOrderModel} from '../../../../core-module/model/work-order/inspection-work-order.model';
import {ClearBarrierWorkOrderModel} from '../../../../core-module/model/work-order/clear-barrier-work-order.model';

/**
 * 巡检,销障等列表公共组件
 */
@Component({
  selector: 'app-work-order-common',
  templateUrl: './work-order-common.component.html',
})
export class WorkOrderCommonComponent implements OnInit {
  // 设施id
  @Input()
  public id: string;
  // 类型
  @Input()
  public facilityType: ObjectTypeEnum;
  // 工单状态模版实例
  @ViewChild('statusTemp') statusTemp: TemplateRef<HTMLDocument>;
  // 数据来源
  @ViewChild('dataResource') dataResource: TemplateRef<HTMLDocument>;
  // 工单列表数据集
  public dataSet: InspectionWorkOrderModel[] | ClearBarrierWorkOrderModel[]  = [];
  // 工单列表参数
  public tableConfig: TableConfigModel;
  // 设备国际化
  public language: FacilityLanguageInterface;
  // 工单国际化
  public workOrderLanguage: WorkOrderLanguageInterface;
  //  公共国际化
  public commonLanguage: CommonLanguageInterface;
  // 公共列表配置
  public commonConfig: ColumnConfig[];
  // 数据来源枚举
  public dataSourceEnum = WorkOrderResourceEnum;
  // 工单状态枚举值
  public workOrderStatusEnum = WorkOrderStatusEnum;
  // 国际化前缀类型
  public languageEnum = LanguageEnum;
  // 巡检查询条件
  private queryCondition: QueryConditionModel = new QueryConditionModel();
  // 消障工单查询条件
  private queryClearCondition: QueryConditionModel = new QueryConditionModel();

  /**
   * 构造器
   */
  constructor(
    private $nzI18n: NzI18nService,
    private $message: FiLinkModalService,
    private $router: Router,
    private $workOrderForCommonService: WorkOrderForCommonService
  ) {
  }

  /**
   * 组件初始化
   */
  public ngOnInit(): void {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.workOrderLanguage = this.$nzI18n.getLocaleData(LanguageEnum.workOrder);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // 初始化表格
    this.initTableConfig();
    // 查询巡检工单
    this.refreshInspectionData();
  }

  /**
   *  查询巡检工单列表数据
   */
  public refreshInspectionData(): void {
    // 设置每页查询5条数据
    this.queryCondition.pageCondition.pageSize = PageSizeEnum.sizeFive;
    this.queryCondition.pageCondition.pageNum = 1;
    if (this.facilityType === ObjectTypeEnum.facility) {
      this.inspectionDataCommon('procRelatedDevices.deviceId');
    } else {
      this.inspectionDataCommon('equipment.equipmentId');
    }
  }

  /**
   * 查询消障工单列表
   */
  public refreshClearBarrier(): void {
    // 设置每页查询5条数据
    this.queryClearCondition.pageCondition.pageSize = PageSizeEnum.sizeFive;
    this.queryClearCondition.pageCondition.pageNum = 1;
    if (this.facilityType === ObjectTypeEnum.facility) {
      this.clearBarrierCommon('deviceId');
    } else {
      this.clearBarrierCommon('procRelatedEquipment.equipmentId');
    }
  }

  /**
   *   初始化巡检表格参数
   */
  public initTableConfig(): void {
    // 工单公用字段
    this.commonConfig = [
      //  序号
      {
        type: 'serial-number',
        width: 62,
        title: this.language.serialNumber,
        fixedStyle: {fixedLeft: true, style: {left: '0'}}
      },
      { // 工单名称
        title: this.workOrderLanguage.name,
        key: 'title', width: 250,
        searchable: false
      },
      { // 　工单状态
        title: this.workOrderLanguage.status,
        key: 'statusName',
        width: 200,
        searchable: false,
        type: 'render',
        renderTemplate: this.statusTemp,
      },
      { // 责任单位
        title: this.workOrderLanguage.accountabilityUnitName,
        key: 'accountabilityDeptName',
        width: 250,
        searchable: false,
      },
      { // 责任人
        title: this.workOrderLanguage.assignName,
        key: 'assignName',
        width: 250,
        searchable: false,
      },
      { // 期望完成时间
        title: this.workOrderLanguage.expectedCompleteTime,
        key: 'expectedCompletedTime',
        width: 150,
        pipe: 'date',
        searchable: false,
      },
      { // 剩余天数
        title: this.workOrderLanguage.lastDays,
        key: 'lastDays',
        width: 250,
        searchable: false,
      }
    ];
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      scroll: {x: '1000px', y: '400px'},
      topButtons: [],
      noIndex: true,
      columnConfig: this.commonConfig,
      showPagination: false,
      bordered: false,
      showSearch: false,
      operation: []
    };
  }

  /**
   * 初始化销障工单表格参数
   */
  public initClearTableConfig(): void {
    const tempColumn = [
      { //  数据来源
        title: this.language.dataResourceType, key: 'dataResourceType', width: 120,
        type: 'render',
        renderTemplate: this.dataResource,
        searchable: false
      },
      {//  关联故障
        title: this.language.associatedFault, key: 'dataResourceName', width: 120,
        searchable: false
      },
      { // 操作
        title: this.commonLanguage.operate, searchable: false,
        searchConfig: {
          type: 'operate'
        },
        key: '',
        width: 150,
        fixedStyle: {fixedRight: true, style: {right: '0px'}}
      }];
    this.tableConfig = {
      isDraggable: true,
      isLoading: true,
      scroll: {x: '1000px', y: '400px'},
      topButtons: [],
      noIndex: true,
      columnConfig: _.concat(this.commonConfig, tempColumn),
      showPagination: false,
      bordered: false,
      showSearch: false,
      operation: [
        { // 查看来源
          text: this.language.viewResource,
          className: 'fiLink-alarm-facility',
          handle: (data: ClearBarrierWorkOrderModel) => {
            if (data.dataResourceType === WorkOrderResourceEnum.alarm) {
              // 跳转到当前告警
              if (data.refAlarm) {
                const queryParams = {
                  id: data.refAlarm
                };
                // 关联告警为当前告警
                this.$router.navigate([`business/alarm/current-alarm`],
                  {queryParams: queryParams}).then();
              } else {
                this.$message.info(this.language.workOrderNotRefAlarm);
              }
            } else {
              if (!data.troubleId) {
                this.$message.info(this.language.workOrderNotRefTrouble);
                return;
              }
              const queryParams = {
                id: data.troubleId
              };
              // 跳转到故障页面
              this.$router.navigate([`business/trouble/trouble-list`],
                {queryParams: queryParams}).then();
            }
          }
        },
        {
          // 详情
          text: this.commonLanguage.writeOffOrderDetail,
          className: 'fiLink-view-detail',
          handle: (currentIndex: ClearBarrierWorkOrderModel) => {
            this.navigateToDetail('business/work-order/clear-barrier/unfinished-detail/view', {
              queryParams: {
                id: currentIndex.procId,
                type: 'unfinished'
              }
            });
          }
        },
      ]
    };
  }

  /**
   * 跳转
   * param url
   */
  private navigateToDetail(url: string, extras = {}): void {
    this.$router.navigate([url], extras).then();
  }

  /**
   * 查询巡检工单列表公共方法
   * @param inspectionFilterField string
   * @param queryInspectionListUrl string
   */
  private inspectionDataCommon(inspectionFilterField: string): void {
    const filterTemp = new FilterCondition(inspectionFilterField, OperatorEnum.eq, this.id);
    // 如果条件集中不存在设备ID的过滤条件就添加进去
    const index = this.queryCondition.filterConditions.findIndex(
      item => item.filterField === inspectionFilterField);
    if (index < 0) {
      this.queryCondition.filterConditions =
        this.queryCondition.filterConditions.concat([filterTemp]);
    }
    this.tableConfig.isLoading = true;
    this.$workOrderForCommonService.queryInspectionList(this.queryCondition).subscribe(
      (result: ResultModel<InspectionWorkOrderModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          this.dataSet = result.data || [];
          this.tableConfig.isLoading = false;
          if (!_.isEmpty(this.dataSet)) {
            this.dataSet.forEach(item => {
              // 设置工单状态的图标样式
              item.statusClass = WorkOrderStatusUtil.getWorkOrderIconClassName(item.status);
            });
          }
        } else {
          this.tableConfig.isLoading = false;
          this.$message.error(result.msg);
        }
      }, () => {
        this.tableConfig.isLoading = false;
      });
  }

  /**
   * 查询消障工单列表公共方法
   * @param clearFilterField string
   */
  private clearBarrierCommon(clearFilterField: string): void {
    const clearFilter = new FilterCondition(clearFilterField,
      OperatorEnum.eq, this.id);
    // 如果条件中不存在设备ID的过滤条件就添加进去
    const index = this.queryClearCondition.filterConditions.findIndex(
      item => item.filterField === clearFilterField);
    if (index < 0) {
      this.queryClearCondition.filterConditions =
        this.queryClearCondition.filterConditions.concat([clearFilter]);
    }
    this.tableConfig.isLoading = true;
    this.$workOrderForCommonService.queryClearList(this.queryClearCondition).subscribe(
      (result: ResultModel<ClearBarrierWorkOrderModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          this.tableConfig.isLoading = false;
          this.dataSet = result.data || [];
          if (!_.isEmpty(this.tableConfig)) {
            this.dataSet.forEach(item => {
              // 获取状态图标
              item.statusClass = WorkOrderStatusUtil.getWorkOrderIconClassName(item.status);
            });
          }
        } else {
          this.tableConfig.isLoading = false;
          this.$message.error(result.msg);
        }
      }, () => {
        this.tableConfig.isLoading = false;
      });
  }
}
