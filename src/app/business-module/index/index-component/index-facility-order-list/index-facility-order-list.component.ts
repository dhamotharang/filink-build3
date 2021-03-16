import {Component, Input, OnInit, AfterContentInit, TemplateRef, ViewChild} from '@angular/core';
import {NzI18nService} from 'ng-zorro-antd';
import {IndexWorkOrderService} from '../../../../core-module/api-service/index/index-work-order';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {IndexLanguageInterface} from '../../../../../assets/i18n/index/index.language.interface';
import {FilterCondition, QueryConditionModel} from '../../../../shared-module/model/query-condition.model';
import {Router} from '@angular/router';
import {InspectionAndClearModel} from '../../shared/model/work-order-condition.model';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {MapCoverageService} from '../../../../shared-module/service/index/map-coverage.service';
import {WorkOrderStatusClassEnum} from '../../../../core-module/enum/work-order/work-order-status-class.enum';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageSizeEnum} from '../../../../shared-module/enum/page-size.enum';
import {IndexWorkOrderStateEnum, IndexWorkOrderTypeEnum} from '../../../../core-module/enum/work-order/work-order.enum';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {WorkOrderLanguageInterface} from '../../../../../assets/i18n/work-order/work-order.language.interface';
import * as _ from 'lodash';
import {MapTypeEnum} from '../../../../core-module/enum/index/index.enum';
import {SessionUtil} from '../../../../shared-module/util/session-util';

/**
 * 工单列表组件
 */
@Component({
  selector: 'app-index-facility-order-list',
  templateUrl: './index-facility-order-list.component.html',
  styleUrls: ['./index-facility-order-list.component.scss']
})
export class IndexFacilityOrderListComponent implements OnInit, AfterContentInit {
  // 是否展示统计按钮
  @Input() isShowStatistics: boolean;
  // 是否展示更多
  @Input() isShowMore: boolean;
  // 是更多按钮的样式
  @Input() isStyleSwitch: boolean;
  // 是否是下拉选择器
  @Input() isSelect: boolean;
  // 设施id
  @Input() facilityId: string;
  // 设施Name
  @Input() facilityName: string;
  // 设施设备id对象集合
  @Input() idData: { deviceId: string, equipmentId: string };
  // 当前的状态（设施或设备）
  @Input() facilityType: MapTypeEnum;
  // 工单状态模板
  @ViewChild('statusTemp') statusTemp: TemplateRef<HTMLDocument>;

  // 国际化
  public indexLanguage: IndexLanguageInterface;
  // 国际化
  public workOrderLanguage: WorkOrderLanguageInterface;
  // 更多
  public more: string;
  // 选择的工单类型
  public searchWorkOrderName: string;
  // 默认显示的表格
  public defaultShowTable: boolean;
  // 工单数据集
  public workOrderDataSet: InspectionAndClearModel[] = [];
  // 工单表格配置
  public workOrderTableConfig: TableConfigModel;
  // 当前图层
  public indexType = this.$mapCoverageService.showCoverage;
  // 巡检和销障设施设备图层的查询条件
  public queryOrderCondition: QueryConditionModel = new QueryConditionModel();
  // 工单类型枚举
  public indexWorkOrderTypeEnum = IndexWorkOrderTypeEnum;
  // 工单下拉数据
  public orderData: any[] = [];

  public constructor(
    private $router: Router,
    private $nzI18n: NzI18nService,
    private $message: FiLinkModalService,
    private $mapCoverageService: MapCoverageService,
    private $indexWorkOlder: IndexWorkOrderService) {
    this.indexLanguage = this.$nzI18n.getLocaleData(LanguageEnum.index);
    this.workOrderLanguage = this.$nzI18n.getLocaleData(LanguageEnum.workOrder);
  }

  public ngOnInit(): void {
    // 巡检工单表格配置加载
    this.initWorkOrderTable(IndexWorkOrderTypeEnum.inspection);
    // 销障工单表格配置加载
    this.initWorkOrderTable(IndexWorkOrderTypeEnum.clearFailure);
    // 默认选中的表格
    this.defaultShowTable = true;
    // 表格初始化五条数据
    this.queryOrderCondition.pageCondition.pageSize = PageSizeEnum.sizeFive;
  }

  public ngAfterContentInit(): void {
    // 巡检工单列表租户权限配置
    if (SessionUtil.checkHasTenantRole('2-3-2')) {
      this.orderData.push( {value: this.indexWorkOrderTypeEnum.inspection , label: this.indexLanguage.inspectionWorkOrder});
      // 表格名称国际化
      this.searchWorkOrderName = this.indexWorkOrderTypeEnum.inspection;
    }
    // 销障工单列表租户权限配置
    if (SessionUtil.checkHasTenantRole('2-3-3')) {
      this.orderData.push( {value: this.indexWorkOrderTypeEnum.clearFailure , label: this.indexLanguage.clearBarrierWorkOrder});
      if (this.searchWorkOrderName !== this.indexWorkOrderTypeEnum.inspection || !this.searchWorkOrderName) {
        this.searchWorkOrderName = this.indexWorkOrderTypeEnum.clearFailure;
      }
    }
    // 没有租户权限，默认不加载
    if (this.searchWorkOrderName) {
      this.searchWorkOrder(this.searchWorkOrderName);
    }

  }

  /**
   *  选择工单
   */
  public searchWorkOrder(workOrderType: string): void {
    // 选择巡检
    if (workOrderType === this.indexWorkOrderTypeEnum.inspection) {
      this.defaultShowTable = true;
      this.getWorkOrderTable(IndexWorkOrderTypeEnum.inspection);
    }
    // 选择销障
    if (workOrderType === this.indexWorkOrderTypeEnum.clearFailure) {
      this.defaultShowTable = false;
      this.getWorkOrderTable(IndexWorkOrderTypeEnum.clearFailure);
    }
  }

  /**
   *  查询参数配置
   */
  public getWorkOrderTable(param: IndexWorkOrderTypeEnum): void {
    this.queryOrderCondition.filterConditions = [];
    // 当前显示的是巡检工单
    if (param === IndexWorkOrderTypeEnum.inspection) {
      // 巡检查询参数配置
      const paramTemp = this.indexType === MapTypeEnum.facility ? 'procRelatedDevices.deviceId' : 'procRelatedEquipment.equipmentId';
      this.queryOrderCondition.filterConditions.push(
        new FilterCondition(paramTemp, OperatorEnum.eq, this.facilityId));
      this.getInspectionTable(IndexWorkOrderTypeEnum.inspection);
      this.initWorkOrderTable(IndexWorkOrderTypeEnum.inspection);
    }
    // 当前显示的销障工单
    if (param === IndexWorkOrderTypeEnum.clearFailure) {
      // 销障查询参数配置
      const paramTemp = this.indexType === MapTypeEnum.facility ? 'deviceId' : 'equipment.equipmentId';
      this.queryOrderCondition.filterConditions.push(
        new FilterCondition(paramTemp, OperatorEnum.eq, this.facilityId));
      this.getInspectionTable(IndexWorkOrderTypeEnum.clearFailure);
      this.initWorkOrderTable(IndexWorkOrderTypeEnum.clearFailure);
    }
  }

  /**
   * 跳转至工单列表
   */
  public goToWorkOrderPage(): void {
    let data;
    data = new Object();
    data.name = this.facilityName;
    if (this.idData.equipmentId) {
      data.equipmentId = this.idData.equipmentId;
    } else {
      data.deviceId = this.idData.deviceId;
    }
    if (this.defaultShowTable) {
      // 跳转巡检工单
      this.$router.navigate([`/business/work-order/inspection/unfinished-list`], {
        queryParams: data
      }).then();
    } else {
      // 跳转销障工单
      this.$router.navigate([`/business/work-order/clear-barrier/unfinished-list`], {
        queryParams: data
      }).then();
    }
  }

  /**
   *  查询巡检数据
   */
  private getInspectionTable(orderType: IndexWorkOrderTypeEnum): void {
    this.workOrderTableConfig.isLoading = true;
    this.$indexWorkOlder.queryWorkOrderListByIdForHome(orderType, this.indexType, this.queryOrderCondition)
      .subscribe((result: ResultModel<InspectionAndClearModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          this.workOrderDataSet = result.data || [];
          // 表格数据转换
          this.workOrderDataSet.forEach(item => {
            item.statusClass = this.getStatusClass(item.status);
            item.statusName = this.getStatusName(item.status);
            // 告警关联故障和关联告警
            if (item.refAlarmCode) {
              item.refAlarmFaultName = `${this.workOrderLanguage.alarm}：${item.refAlarmName}`;
            } else if (item.troubleId) {
              item.refAlarmFaultName = `${this.workOrderLanguage.fault}：${item.troubleName}`;
            }
          });
        } else {
          this.$message.error(result.msg);
        }
        this.workOrderTableConfig.isLoading = false;
      }, () => {
        this.workOrderTableConfig.isLoading = false;
      });
  }

  /**
   * 工单表格配置
   */
  private initWorkOrderTable(orderType: IndexWorkOrderTypeEnum): void {
    const columnConfigs = [
      {
        // 工单名称
        title: this.indexLanguage.workOrderName, key: 'title', width: 100,
        configurable: false,
        searchable: false,
      },
      {
        // 工单状态
        title: this.indexLanguage.workOrderStatus, key: 'status', width: 100,
        configurable: false,
        searchable: false,
        searchKey: 'status',
        type: 'render',
        renderTemplate: this.statusTemp,
      },
      {
        // 责任单位
        title: this.indexLanguage.responsibilityUnit, key: 'accountabilityDeptName', width: 100,
        configurable: false,
        searchable: false,
        pipe: null,
      },
      {
        // 责任人
        title: this.indexLanguage.responsibilityPerson, key: 'assignName', width: 100,
        configurable: false,
        searchable: false,
        pipe: null,
      },
    ];
    // 巡检表格配置
    if (orderType === IndexWorkOrderTypeEnum.inspection) {
      columnConfigs.push(
        {
          // 期望完工时间
          title: this.indexLanguage.expectedCompletedTime, key: 'expectedCompletedTime', width: 150,
          configurable: false,
          searchable: false,
          pipe: 'date',
        },
        {
          // 剩余天数
          title: this.indexLanguage.remainingDays, key: 'lastDays', width: 80,
          configurable: false,
          searchable: false,
          pipe: null,
        }
      );
    }
    // 销障表格配置
    if (orderType === IndexWorkOrderTypeEnum.clearFailure) {
      columnConfigs.push(
        {
          // 剩余天数
          title: this.indexLanguage.remainingDays, key: 'lastDays', width: 80,
          configurable: false,
          searchable: false,
          pipe: null,
        },
        {
          // 关联告警 故障
          title: this.workOrderLanguage.relevance + this.workOrderLanguage.alarm + '/' + this.workOrderLanguage.fault,
          key: 'refAlarmFaultName', width: 150,
          configurable: false,
          searchable: false,
        },
      );
    }

    // 列表配置
    this.workOrderTableConfig = {
      isDraggable: true,
      isLoading: false,
      notShowPrint: true,
      showSearchSwitch: false,
      showRowSelection: false,
      showSizeChanger: true,
      showSearchExport: false,
      searchReturnType: 'object',
      scroll: {x: '900px', y: '600px'},
      noIndex: true,
      columnConfig: _.concat(columnConfigs),
      showPagination: false,
      simplePage: false,
      bordered: false,
      showSearch: false,
      operation: [],
    };
  }

  /**
   * 获取工单类型名称
   *
   */
  private getStatusName(status: string): string {
    return this.indexLanguage[IndexWorkOrderStateEnum[status]] || '';
  }

  /**
   * 获取工单类型样式
   * param status
   * returns {string}
   */
  private getStatusClass(status: string): string {
    return `iconfont icon-fiLink ${WorkOrderStatusClassEnum[status]}`;
  }
}
