import {AfterContentInit, Component, Input, Output, OnChanges, OnInit, TemplateRef, ViewChild, EventEmitter, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {NzI18nService} from 'ng-zorro-antd';
import {IndexWorkOrderService} from '../../../../core-module/api-service/index/index-work-order';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {ClearWorkOrderModel, InspectionWorkOrderModel} from '../../shared/model/work-order-condition.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {WorkOrderStatusClassEnum} from '../../../../core-module/enum/work-order/work-order-status-class.enum';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {IndexLanguageInterface} from '../../../../../assets/i18n/index/index.language.interface';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {PageSizeEnum} from '../../../../shared-module/enum/page-size.enum';
import {IndexWorkOrderStateEnum, IndexWorkOrderTypeEnum} from '../../../../core-module/enum/work-order/work-order.enum';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import * as _ from 'lodash';
import {WorkOrderLanguageInterface} from '../../../../../assets/i18n/work-order/work-order.language.interface';
import {IndexApiService} from '../../service/index/index-api.service';
import {AreaModel} from '../../shared/model/area.model';
import {SessionUtil} from '../../../../shared-module/util/session-util';

/**
 * 工单列表
 */
@Component({
  selector: 'app-index-order-table',
  templateUrl: './index-order-table.component.html',
  styleUrls: ['./index-order-table.component.scss']
})
export class IndexOrderTableComponent implements OnInit, OnChanges, AfterContentInit {
  // 区域数据
  @Input() areaData: string[];
  // 工单类型数据数据
  @Input() orderTypeData = IndexWorkOrderTypeEnum.inspection;
  // 工单状态数据数据
  @Input() orderStateData: string[];
  // 工单显示的工单
  @Input() defaultShowTable = true;
  // 工单名称
  @Input() titleName: string;
  // 列表选中的工单类型
  @Input() selectedWorkOrderType: string;
  // 发送工单选中类型
  @Output() selectWorkOrderTypeChange = new EventEmitter<any>();
  // 工单状态模板
  @ViewChild('statusTemp') statusTemp: TemplateRef<HTMLDocument>;
  // 进度转换
  @ViewChild('progressSpeed') progressSpeed: TemplateRef<HTMLDocument>;
  // 表格下拉
  public selectOption: any[] = [];
  // 国际化
  public indexLanguage: IndexLanguageInterface;
  // 国际化
  public commonLanguage: CommonLanguageInterface;
  // 国际化
  public workOrderLanguage: WorkOrderLanguageInterface;
  // 巡检工单表格配置
  public workOrderInspectionTableConfig: TableConfigModel;
  // 巡检工单数据集
  public workOrderInspectionDataSet: InspectionWorkOrderModel[] = [];
  // 巡检工单分页
  public workOrderInspectionPageBean: PageModel = new PageModel(PageSizeEnum.sizeFive);
  // 巡检工单全量查询条件
  public queryInspectionCondition: QueryConditionModel = new QueryConditionModel();
  // 销障工单表格配置
  public workOrderClearTableConfig: TableConfigModel;
  // 销障工单数据集
  public workOrderClearDataSet: ClearWorkOrderModel[] = [];
  // 销障工单分页
  public workOrderClearPageBean: PageModel = new PageModel(PageSizeEnum.sizeFive);
  // 销障工单全量查询条件
  public queryClearCondition: QueryConditionModel = new QueryConditionModel();
  // 工单状态枚举
  public workOrderStatusEnum = IndexWorkOrderStateEnum;
  // 全量区域数据，包括子集区域数据
  public areaAllData: string[] = [];
  // 选中的工单类型
  public selectWorkOrderType: string = '';
  // 巡检表格检索条件
  private searchInspectionCondition: boolean = true;
  // 销障表格检索条件
  private searchClearCondition: boolean = true;
  // 工单类型枚举
  public indexWorkOrderTypeEnum = IndexWorkOrderTypeEnum;
  // 工单下拉数据
  public orderData: any[] = [];
  public constructor(
    private $router: Router,
    private $nzI18n: NzI18nService,
    private $message: FiLinkModalService,
    private $indexWorkOlder: IndexWorkOrderService,
    private $indexApiService: IndexApiService
  ) {
    this.indexLanguage = this.$nzI18n.getLocaleData(LanguageEnum.index);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.workOrderLanguage = this.$nzI18n.getLocaleData(LanguageEnum.workOrder);
  }

  public ngOnInit(): void {
    // 标题名称国际化
    this.titleName = this.indexLanguage.inspectionWorkOrder;
    Object.keys(this.workOrderStatusEnum).forEach(item => {
      this.selectOption.push({value: item, label: this.indexLanguage[item]});
    });
    // 巡检工单表格分页配置
    this.queryInspectionCondition.pageCondition.pageSize = PageSizeEnum.sizeFive;
    // 销障工单表格分页配置
    this.queryClearCondition.pageCondition.pageSize = PageSizeEnum.sizeFive;
    // 巡检工单列表租户权限配置
    if (SessionUtil.checkHasTenantRole('1-3-4')) {
      this.selectWorkOrderType = this.indexWorkOrderTypeEnum.inspection;
      this.orderData.push( {value: this.indexWorkOrderTypeEnum.inspection , label: this.indexLanguage.inspectionWorkOrder});
    }
    // 销障工单列表租户权限配置
    if (SessionUtil.checkHasTenantRole('1-3-5')) {
      if (this.selectWorkOrderType !== this.indexWorkOrderTypeEnum.inspection || !this.selectWorkOrderType) {
        this.selectWorkOrderType = this.indexWorkOrderTypeEnum.clearFailure;
        this.orderTypeData = IndexWorkOrderTypeEnum.clearFailure;
        this.defaultShowTable = true;
      }
      this.orderData.push( {value: this.indexWorkOrderTypeEnum.clearFailure , label: this.indexLanguage.clearBarrierWorkOrder});
    }
  }

  public ngAfterContentInit(): void {
    // 加载巡检表格配置
    this.initInspectionWorkOrderTable();
    this.workOrderInspectionTableConfig.isLoading = false;
    // 加载销障表格配置
    this.initClearWorkOrderTable();
    this.workOrderClearTableConfig.isLoading = false;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.selectedWorkOrderType) {
      this.selectWorkOrderType = this.selectedWorkOrderType;
    }
    if (this.areaData && this.orderStateData) {
      // 加载巡检工单
      if (this.selectWorkOrderType === IndexWorkOrderTypeEnum.inspection) {
        this.initInspectionWorkOrderTable();
        // 先获取全量的区域数据
        this.getAllAreaList(this.areaData).then((data) => {
          this.getInspectionWorkOrderTable(true);
        });
      }
      // 加载销障
      if (this.selectWorkOrderType === IndexWorkOrderTypeEnum.clearFailure) {
        this.initClearWorkOrderTable();
        // 先获取全量的区域数据
        this.getAllAreaList(this.areaData).then((data) => {
          this.getClearWorkOrderTable(true);
        });
      }
    }
  }

  /**
   * 获取全量的区域数据，包括子集区域
   * param areaData
   */
  public getAllAreaList(areaData: string[]): Promise<string> {
    this.areaAllData = [];
    return new Promise((resolve, reject) => {
      this.$indexApiService.listAreaByAreaCodeList(areaData).subscribe((result: ResultModel<AreaModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          result.data.forEach(item => {
            this.areaAllData.push(item.areaCode);
          });
          if (!result.data) {
            this.areaAllData = ['noData'];
          }
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  /**
   * 跳转至工单列表
   */
  public goToWorkOrderPage(): void {
    if (this.defaultShowTable) {
      // 跳转销障
      this.$router.navigate([`/business/work-order/clear-barrier/unfinished-list`]).then();
    } else {
      // 跳转巡检
      this.$router.navigate([`/business/work-order/inspection/unfinished-list`]).then();
    }
  }

  /**
   * 巡检工单表格分页
   */
  public pageWorkOrderInspection(event: PageModel): void {
    this.queryInspectionCondition.pageCondition.pageNum = event.pageIndex;
    this.queryInspectionCondition.pageCondition.pageSize = event.pageSize;
    this.queryInspectionListForHome();
  }

  /**
   * 销障工单表格分页
   */
  public pageWorkOrderClear(event: PageModel): void {
    this.queryClearCondition.pageCondition.pageNum = event.pageIndex;
    this.queryClearCondition.pageCondition.pageSize = event.pageSize;
    this.queryClearListForHome();
  }

  /**
   * 工单类型下拉列表改变
   */
  public workOrderChange(workOrderType): void {
    // 选择巡检
    if (workOrderType === IndexWorkOrderTypeEnum.inspection) {
      this.selectWorkOrderType = workOrderType;
      this.selectedWorkOrderType = workOrderType;
      this.defaultShowTable = false;
      this.selectWorkOrderTypeChange.emit(this.selectWorkOrderType);
    }
    // 选择销障
    if (workOrderType === IndexWorkOrderTypeEnum.clearFailure) {
      this.selectWorkOrderType = workOrderType;
      this.selectedWorkOrderType = workOrderType;
      this.defaultShowTable = true;
      this.selectWorkOrderTypeChange.emit(this.selectWorkOrderType);
    }

    if (this.areaData && this.orderStateData) {
      // 加载巡检工单
      if (this.selectWorkOrderType === IndexWorkOrderTypeEnum.inspection) {
        this.initInspectionWorkOrderTable();
        // 先获取全量的区域数据
        this.getAllAreaList(this.areaData).then((data) => {
          this.getInspectionWorkOrderTable(true);
        });
      }
      // 加载销障
      if (this.selectWorkOrderType === IndexWorkOrderTypeEnum.clearFailure) {
        this.initClearWorkOrderTable();
        // 先获取全量的区域数据
        this.getAllAreaList(this.areaData).then((data) => {
          this.getClearWorkOrderTable(true);
        });
      }
    }
  }

  /**
   * 巡检工单表格数据加载
   */
  private getInspectionWorkOrderTable(param?: boolean): void {
    if (param) {
      this.queryInspectionCondition.filterConditions = [];
    }
    // 获取区域
    if (this.areaData && this.areaData.length > 0) {
      this.queryInspectionCondition.filterConditions.push(new FilterCondition('deviceAreaCode', OperatorEnum.in, this.areaAllData));
    }
    // 获取工单状态
    if (this.orderStateData && this.orderStateData.length > 0 && this.searchInspectionCondition) {
      this.queryInspectionCondition.filterConditions.push(new FilterCondition('status', OperatorEnum.in, this.orderStateData));
    }
    this.queryInspectionListForHome();
  }

  /**
   * 销障工单表格数据加载
   */
  private getClearWorkOrderTable(param?: boolean): void {
    if (param) {
      this.queryClearCondition.filterConditions = [];
    }
    // 获取区域
    if (this.areaData && this.areaData.length > 0) {
      this.queryClearCondition.filterConditions.push(new FilterCondition('deviceAreaCode', OperatorEnum.in, this.areaAllData));
    }
    // 获取工单状态
    if (this.orderStateData && this.orderStateData.length > 0 && this.searchClearCondition) {
      this.queryClearCondition.filterConditions.push(new FilterCondition('status', OperatorEnum.in, this.orderStateData));
    }
    this.queryClearListForHome();
  }

  /**
   * 巡检接口查询数据
   */
  private queryInspectionListForHome(): void {
    this.workOrderInspectionTableConfig.isLoading = true;
    // 接口获取巡检工单数据
    this.$indexWorkOlder.queryInspectionListForHome(this.queryInspectionCondition)
      .subscribe((result: ResultModel<InspectionWorkOrderModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          this.workOrderInspectionPageBean.Total = result.totalCount;
          this.workOrderInspectionPageBean.pageIndex = result.pageNum;
          this.workOrderInspectionPageBean.pageSize = result.size;
          this.workOrderInspectionDataSet = result.data || [];
          // 数据遍历改造
          this.workOrderInspectionDataSet.forEach(item => {
            item.statusClass = this.getStatusClass(item.status);
            item.statusName = this.getStatusName(item.status);
          });
        } else {
          this.$message.error(result.msg);
        }
        this.searchInspectionCondition = true;
        this.workOrderInspectionTableConfig.isLoading = false;
      }, () => {
        this.workOrderInspectionTableConfig.isLoading = false;
      });
  }

  /**
   * 销障接口查询数据
   */
  private queryClearListForHome(): void {
    this.workOrderClearTableConfig.isLoading = true;
    // 获取销障工单数据
    this.$indexWorkOlder.queryClearListForHome(this.queryClearCondition).subscribe((result: ResultModel<ClearWorkOrderModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        this.workOrderClearPageBean.Total = result.totalCount;
        this.workOrderClearPageBean.pageIndex = result.pageNum;
        this.workOrderClearPageBean.pageSize = result.size;
        this.workOrderClearDataSet = result.data || [];
        // 数据遍历改造
        this.workOrderClearDataSet.forEach(item => {
          item.statusClass = this.getStatusClass(item.status);
          item.statusName = this.getStatusName(item.status);
          // 告警关联故障和关联告警
          if (item.refAlarmCode && item.refAlarmName) {
            item.refAlarmFaultName = `${this.workOrderLanguage.alarm}：${item.refAlarmName}`;
          } else if (item.troubleId && item.troubleName) {
            item.refAlarmFaultName = `${this.workOrderLanguage.fault}：${item.troubleName}`;
          }
        });
      } else {
        this.$message.error(result.msg);
      }
      this.searchClearCondition = true;
      this.workOrderClearTableConfig.isLoading = false;
    }, () => {
      this.workOrderClearTableConfig.isLoading = false;
    });
  }

  /**
   * 巡检工单表格配置
   */
  private initInspectionWorkOrderTable(): void {
    const inspectionTable = _.concat(this.intiColumnConfigData());
    inspectionTable.push(
      {
        // 进度
        title: this.indexLanguage.schedule, key: 'progressSpeed', width: 100,
        configurable: false,
        isShowSort: true,
        searchable: false,
        type: 'render',
        renderTemplate: this.progressSpeed,
        searchConfig: {type: 'input'},
        fixedStyle: null
      },
      {
        title: this.indexLanguage.operation, key: '', width: 80,
        configurable: false,
        isShowSort: false,
        searchable: true,
        searchConfig: {type: 'operate'},
        fixedStyle: {fixedRight: true, style: {right: '0px'}}
      }
    );
    this.workOrderInspectionTableConfig = {
      isDraggable: true,
      isLoading: true,
      simplePageTotalShow: true,
      notShowPrint: true,
      showSearchSwitch: false,
      showRowSelection: false,
      showSizeChanger: true,
      showSearchExport: false,
      searchReturnType: 'object',
      scroll: {x: '900px', y: '600px'},
      showPagination: true,
      simplePage: true,
      bordered: false,
      showSearch: false,
      noIndex: true,
      columnConfig: inspectionTable,
      sort: (event: SortCondition) => {
        // 排序
        this.queryInspectionCondition.sortCondition.sortField = event.sortField;
        this.queryInspectionCondition.sortCondition.sortRule = event.sortRule;
        this.queryInspectionListForHome();
      },
      handleSearch: (event: FilterCondition) => {
        // 表格检索
        this.queryInspectionCondition.filterConditions = [];
        this.queryInspectionCondition.pageCondition.pageNum = 1;
        // 条件筛选
        for (const item in event) {
          if (event[item]) {
            // 工单状态使用下拉查询
            if (item === 'status' && event[item].length > 0) {
              this.searchInspectionCondition = false;
              if (!event[item].length) {
                this.queryInspectionCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.in, this.orderStateData));
              } else {
                this.queryInspectionCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.in, event[item]));
              }
            } else if (['title', 'accountabilityDeptName', 'assignName'].includes(item)) {
              // 工单名称、责任单位、责任人使用模糊查询
              this.queryInspectionCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.like, event[item]));
            }
          }
        }
        this.getInspectionWorkOrderTable(false);
      },
    };
  }

  /**
   * 销障表格配置
   */
  private initClearWorkOrderTable(): void {
    const clearTable = _.concat(this.intiColumnConfigData());
    clearTable.push(
      {
        // 剩余天数
        title: this.indexLanguage.remainingDays, key: 'lastDays', width: 100,
        configurable: false,
        isShowSort: true,
        searchable: false,
        searchKey: 'lastDays',
        searchConfig: {type: 'input'}
      },
      {
        // 关联告警 故障
        title: this.workOrderLanguage.relevance + this.workOrderLanguage.alarm + '/' + this.workOrderLanguage.fault,
        key: 'refAlarmFaultName', width: 140,
        configurable: false,
        isShowSort: true,
        searchable: false,
        searchKey: 'refAlarmFaultName',
        searchConfig: {type: 'input'}
      },
      {
        title: this.indexLanguage.operation, key: '', width: 80,
        configurable: false,
        searchable: true,
        searchConfig: {type: 'operate'},
        fixedStyle: {fixedRight: true, style: {right: '0px'}}
      }
    );
    this.workOrderClearTableConfig = {
      isDraggable: true,
      isLoading: true,
      simplePageTotalShow: true,
      notShowPrint: true,
      showSearchSwitch: false,
      showRowSelection: false,
      showSizeChanger: true,
      showSearchExport: false,
      searchReturnType: 'object',
      scroll: {x: '600', y: '400px'},
      showPagination: true,
      simplePage: true,
      bordered: false,
      showSearch: false,
      noIndex: true,
      columnConfig: clearTable,
      sort: (event: SortCondition) => {
        this.queryClearCondition.sortCondition.sortField = event.sortField;
        this.queryClearCondition.sortCondition.sortRule = event.sortRule;
        this.queryClearListForHome();
      },
      handleSearch: (event: FilterCondition) => {
        this.queryClearCondition.filterConditions = [];
        this.queryClearCondition.pageCondition.pageNum = 1;
        // 销账表格条件查询
        for (const item in event) {
          if (event[item]) {
            // 工单状态使用下拉查询
            if (item === 'status' && event[item].length > 0) {
              this.searchClearCondition = false;
              if (!event[item].length) {
                this.queryClearCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.in, this.orderStateData));
              } else {
                this.queryClearCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.in, event[item]));
              }
            } else if (['title', 'accountabilityDeptName', 'assignName', 'troubleName'].includes(item)) {
              // 工单名称、责任单位、责任人、关联故障使用模糊查询
              this.queryClearCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.like, event[item]));
            }
          }
        }
        this.getClearWorkOrderTable(false);
      },
    };
  }

  /**
   * 获取工单类型样式
   *
   */
  private getStatusClass(status: string): string {
    return `iconfont icon-fiLink ${WorkOrderStatusClassEnum[status]}`;
  }

  /**
   * 获取工单类型名称
   *
   */
  private getStatusName(status: string): string {
    return this.indexLanguage[IndexWorkOrderStateEnum[status]] || '';
  }

  /**
   * 初始化表格配置
   */
  private intiColumnConfigData(): object  {
    const columnConfigs = [
      {
        // 工单ID
        title: '', key: 'procId', width: 100,
        hidden: true
      },
      {
        // 名称
        title: this.indexLanguage.workOrderName, key: 'title', width: 100,
        configurable: false,
        isShowSort: true,
        searchable: true,
        searchConfig: {type: 'input'}
      },
      {
        // 工单状态
        title: this.indexLanguage.workOrderStatus, key: 'status', width: 130,
        configurable: false,
        isShowSort: true,
        searchable: true,
        searchKey: 'status',
        type: 'render',
        searchConfig: {type: 'select', selectType: 'multiple', selectInfo: this.selectOption},
        renderTemplate: this.statusTemp,
      },
      {
        // 责任单位
        title: this.indexLanguage.responsibilityUnit, key: 'accountabilityDeptName', width: 100,
        configurable: false,
        isShowSort: true,
        searchable: true,
        searchConfig: {type: 'input'}
      },
      {
        // 责任人
        title: this.indexLanguage.responsibilityPerson, key: 'assignName', width: 100,
        configurable: false,
        isShowSort: true,
        searchable: true,
        searchConfig: {type: 'input'}
      },
    ];
    return columnConfigs;
  }

  /**
   * 是否显示筛选
   */
  public showSearch(): void {
    this.workOrderInspectionTableConfig.showSearch = !this.workOrderInspectionTableConfig.showSearch;
    this.workOrderClearTableConfig.showSearch = !this.workOrderClearTableConfig.showSearch;

  }
}
